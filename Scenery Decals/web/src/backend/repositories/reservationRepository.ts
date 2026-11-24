import "server-only";

import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getMySqlPool, reconnectMySqlPool } from "@/backend/db/mysql";
import type {
  AdminInventoryItem,
  AdminReservationItem,
  CreateReservationInput,
  ReservationConfirmation,
  ReservationStatus,
} from "@/shared/types/reservation";

export class InventoryUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryUnavailableError";
  }
}

interface InventoryRow extends RowDataPacket {
  product_id: string;
  title: string;
  on_hand_quantity: number;
  reserved_quantity: number;
}

interface AdminReservationRow extends RowDataPacket {
  id: string;
  reference_no: string;
  status: ReservationStatus;
  expires_at: Date;
  created_at: Date;
  admin_note: string | null;
  customer_name: string;
  email: string | null;
  phone: string | null;
  wechat: string | null;
  kakao_talk: string | null;
  whatsapp: string | null;
  customer_note: string | null;
  product_title_snapshot: string;
  product_title_zh: string | null;
  finish: string | null;
  quantity: number;
}

interface ReservationStateRow extends RowDataPacket {
  status: ReservationStatus;
}

interface CountRow extends RowDataPacket { total: number; }

interface AdminInventoryRow extends RowDataPacket {
  product_id: string;
  slug: string;
  title: string;
  is_active: number;
  on_hand_quantity: number;
  reserved_quantity: number;
  updated_at: Date;
}

function isoDate(value: Date | string) {
  return new Date(value).toISOString();
}

function reservationReference() {
  return `RSV-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

export async function createReservation(
  input: CreateReservationInput,
  holdHours: number
): Promise<ReservationConfirmation> {
  const connection = await getMySqlPool().getConnection();
  const reservationId = randomUUID();
  const referenceNo = reservationReference();
  const expiresAt = new Date(Date.now() + holdHours * 60 * 60 * 1000);

  try {
    await connection.beginTransaction();
    const productIds = input.items.map((item) => item.productId);
    const placeholders = productIds.map(() => "?").join(", ");
    const [inventoryRows] = await connection.execute<InventoryRow[]>(
      `SELECT p.id AS product_id, p.title, i.on_hand_quantity, i.reserved_quantity
       FROM products AS p
       INNER JOIN inventory AS i ON i.product_id = p.id
       WHERE p.id IN (${placeholders}) AND p.is_active = TRUE
       FOR UPDATE`,
      productIds
    );
    const inventoryByProduct = new Map(inventoryRows.map((row) => [row.product_id, row]));

    for (const item of input.items) {
      const inventory = inventoryByProduct.get(item.productId);
      if (!inventory) {
        throw new InventoryUnavailableError("A selected product is not available.");
      }
      if (inventory.on_hand_quantity - inventory.reserved_quantity < item.quantity) {
        throw new InventoryUnavailableError(
          `${inventory.title} does not have enough available inventory.`
        );
      }
    }

    await connection.execute(
      `INSERT INTO reservations (id, reference_no, status, expires_at)
       VALUES (?, ?, 'submitted', ?)`,
      [reservationId, referenceNo, expiresAt]
    );
    await connection.execute(
      `INSERT INTO reservation_contacts (reservation_id, name, email, phone, wechat, kakao_talk, whatsapp, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [reservationId, input.contact.name, input.contact.email ?? null, input.contact.phone ?? null, input.contact.wechat ?? null, input.contact.kakaoTalk ?? null, input.contact.whatsapp ?? null, input.contact.note ?? null]
    );

    for (const item of input.items) {
      const inventory = inventoryByProduct.get(item.productId)!;
      const [updated] = await connection.execute<ResultSetHeader>(
        `UPDATE inventory
         SET reserved_quantity = reserved_quantity + ?
         WHERE product_id = ? AND on_hand_quantity - reserved_quantity >= ?`,
        [item.quantity, item.productId, item.quantity]
      );
      if (updated.affectedRows !== 1) {
        throw new InventoryUnavailableError(
          `${inventory.title} became unavailable. Please try again.`
        );
      }
      await connection.execute(
        `INSERT INTO reservation_items
          (id, reservation_id, product_id, product_title_snapshot, finish, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [randomUUID(), reservationId, item.productId, inventory.title, item.finish ?? null, item.quantity]
      );
    }

    await connection.commit();
    return { referenceNo, status: "submitted", expiresAt: expiresAt.toISOString() };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listAdminReservations(): Promise<AdminReservationItem[]> {
  const query = `SELECT r.id, r.reference_no, r.status, r.expires_at, r.created_at, r.admin_note,
            c.name AS customer_name, c.email, c.phone, c.wechat, c.kakao_talk, c.whatsapp, c.note AS customer_note,
            i.product_title_snapshot, p.title_zh AS product_title_zh, i.finish, i.quantity
     FROM reservations AS r
     INNER JOIN reservation_contacts AS c ON c.reservation_id = r.id
     INNER JOIN reservation_items AS i ON i.reservation_id = r.id
     LEFT JOIN products AS p ON p.id = i.product_id
     ORDER BY FIELD(r.status, 'submitted', 'notified', 'contacted', 'confirmed'), r.created_at DESC
     LIMIT 300`;
  let rows: AdminReservationRow[];
  try {
    [rows] = await getMySqlPool().query<AdminReservationRow[]>(query);
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "";
    if (!["ECONNRESET", "PROTOCOL_CONNECTION_LOST", "ECONNREFUSED"].includes(code)) throw error;
    [rows] = await (await reconnectMySqlPool()).query<AdminReservationRow[]>(query);
  }

  const reservations = new Map<string, AdminReservationItem>();
  for (const row of rows) {
    const reservation = reservations.get(row.id) ?? {
      id: row.id,
      referenceNo: row.reference_no,
      status: row.status,
      expiresAt: isoDate(row.expires_at),
      createdAt: isoDate(row.created_at),
      customerName: row.customer_name,
      email: row.email,
      phone: row.phone,
      wechat: row.wechat,
      kakaoTalk: row.kakao_talk,
      whatsapp: row.whatsapp,
      customerNote: row.customer_note,
      adminNote: row.admin_note,
      items: [],
    };
    reservation.items.push({
      productTitle: row.product_title_zh ?? row.product_title_snapshot,
      finish: row.finish,
      quantity: row.quantity,
    });
    reservations.set(row.id, reservation);
  }
  return [...reservations.values()];
}

export async function listAdminReservationsPage({ page, pageSize, search }: { page: number; pageSize: number; search?: string }) {
  const offset = (page - 1) * pageSize;
  const where = search ? ` WHERE r.reference_no LIKE ?
       OR EXISTS (SELECT 1 FROM reservation_contacts AS contact WHERE contact.reservation_id = r.id AND (contact.name LIKE ? OR contact.email LIKE ? OR contact.phone LIKE ? OR contact.wechat LIKE ? OR contact.kakao_talk LIKE ? OR contact.whatsapp LIKE ?))
       OR EXISTS (SELECT 1 FROM reservation_items AS item LEFT JOIN products AS product ON product.id = item.product_id WHERE item.reservation_id = r.id AND (item.product_title_snapshot LIKE ? OR product.title LIKE ? OR product.title_zh LIKE ? OR product.title_ko LIKE ?))` : "";
  const values = search ? Array.from({ length: 11 }, () => `%${search}%`) : [];
  const query = `SELECT r.id, r.reference_no, r.status, r.expires_at, r.created_at, r.admin_note,
            c.name AS customer_name, c.email, c.phone, c.wechat, c.kakao_talk, c.whatsapp, c.note AS customer_note,
            i.product_title_snapshot, p.title_zh AS product_title_zh, i.finish, i.quantity
     FROM (
       SELECT r.id FROM reservations AS r${where}
       ORDER BY FIELD(status, 'submitted', 'notified', 'contacted', 'confirmed'), created_at DESC
       LIMIT ? OFFSET ?
     ) AS selected
     INNER JOIN reservations AS r ON r.id = selected.id
     INNER JOIN reservation_contacts AS c ON c.reservation_id = r.id
     INNER JOIN reservation_items AS i ON i.reservation_id = r.id
     LEFT JOIN products AS p ON p.id = i.product_id
     ORDER BY FIELD(r.status, 'submitted', 'notified', 'contacted', 'confirmed'), r.created_at DESC`;
  let countRows: CountRow[];
  let rows: AdminReservationRow[];
  try {
    [[countRows], [rows]] = await Promise.all([
      getMySqlPool().execute<CountRow[]>(`SELECT COUNT(*) AS total FROM reservations AS r${where}`, values),
      getMySqlPool().execute<AdminReservationRow[]>(query, [...values, pageSize, offset]),
    ]);
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "";
    if (!["ECONNRESET", "PROTOCOL_CONNECTION_LOST", "ECONNREFUSED"].includes(code)) throw error;
    const pool = await reconnectMySqlPool();
    [[countRows], [rows]] = await Promise.all([
      pool.execute<CountRow[]>(`SELECT COUNT(*) AS total FROM reservations AS r${where}`, values),
      pool.execute<AdminReservationRow[]>(query, [...values, pageSize, offset]),
    ]);
  }
  const reservations = new Map<string, AdminReservationItem>();
  for (const row of rows) {
    const reservation = reservations.get(row.id) ?? {
      id: row.id, referenceNo: row.reference_no, status: row.status, expiresAt: isoDate(row.expires_at), createdAt: isoDate(row.created_at),
      customerName: row.customer_name, email: row.email, phone: row.phone, wechat: row.wechat, kakaoTalk: row.kakao_talk,
      whatsapp: row.whatsapp, customerNote: row.customer_note, adminNote: row.admin_note, items: [],
    };
    reservation.items.push({ productTitle: row.product_title_zh ?? row.product_title_snapshot, finish: row.finish, quantity: row.quantity });
    reservations.set(row.id, reservation);
  }
  return { items: [...reservations.values()], total: Number(countRows[0]?.total ?? 0) };
}

export async function updateAdminReservation(
  id: string,
  update: { status: ReservationStatus; adminNote?: string }
): Promise<void> {
  const connection = await getMySqlPool().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<ReservationStateRow[]>(
      "SELECT status FROM reservations WHERE id = ? FOR UPDATE",
      [id]
    );
    const reservation = rows[0];
    if (!reservation) throw new Error("Reservation was not found.");

    const terminalStatuses: ReservationStatus[] = ["cancelled", "declined", "expired", "fulfilled"];
    if (terminalStatuses.includes(reservation.status) && reservation.status !== update.status) {
      throw new Error("A completed reservation cannot be reopened.");
    }

    const releasesInventory = ["cancelled", "declined", "expired"].includes(update.status);
    if (!terminalStatuses.includes(reservation.status) && releasesInventory) {
      await connection.execute(
        `UPDATE inventory AS inventory
         INNER JOIN reservation_items AS item ON item.product_id = inventory.product_id
         SET inventory.reserved_quantity = GREATEST(0, inventory.reserved_quantity - item.quantity)
         WHERE item.reservation_id = ?`,
        [id]
      );
    }

    if (!terminalStatuses.includes(reservation.status) && update.status === "fulfilled") {
      await connection.execute(
        `UPDATE inventory AS inventory
         INNER JOIN reservation_items AS item ON item.product_id = inventory.product_id
         SET inventory.on_hand_quantity = GREATEST(0, inventory.on_hand_quantity - item.quantity),
             inventory.reserved_quantity = GREATEST(0, inventory.reserved_quantity - item.quantity)
         WHERE item.reservation_id = ?`,
        [id]
      );
    }

    await connection.execute(
      "UPDATE reservations SET status = ?, admin_note = ? WHERE id = ?",
      [update.status, update.adminNote ?? null, id]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listAdminInventory(): Promise<AdminInventoryItem[]> {
  const [rows] = await getMySqlPool().query<AdminInventoryRow[]>(
    `SELECT p.id AS product_id, p.slug, p.title, p.is_active,
            i.on_hand_quantity, i.reserved_quantity, i.updated_at
     FROM products AS p
     INNER JOIN inventory AS i ON i.product_id = p.id
     ORDER BY p.title ASC`
  );
  return rows.map((row) => ({
    productId: row.product_id,
    slug: row.slug,
    title: row.title,
    isActive: Boolean(row.is_active),
    onHandQuantity: row.on_hand_quantity,
    reservedQuantity: row.reserved_quantity,
    availableQuantity: row.on_hand_quantity - row.reserved_quantity,
    updatedAt: isoDate(row.updated_at),
  }));
}

export async function adjustAdminInventory(
  productId: string,
  input: { onHandQuantity: number; reason?: string }
): Promise<AdminInventoryItem> {
  const connection = await getMySqlPool().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<AdminInventoryRow[]>(
      `SELECT p.id AS product_id, p.slug, p.title, p.is_active,
              i.on_hand_quantity, i.reserved_quantity, i.updated_at
       FROM products AS p
       INNER JOIN inventory AS i ON i.product_id = p.id
       WHERE p.id = ? FOR UPDATE`,
      [productId]
    );
    const inventory = rows[0];
    if (!inventory) throw new Error("Product inventory was not found.");
    if (input.onHandQuantity < inventory.reserved_quantity) {
      throw new InventoryUnavailableError("在库数量不能低于已预约数量。");
    }

    await connection.execute(
      "UPDATE inventory SET on_hand_quantity = ? WHERE product_id = ?",
      [input.onHandQuantity, productId]
    );
    await connection.execute(
      `INSERT INTO inventory_adjustments
       (id, product_id, previous_on_hand_quantity, new_on_hand_quantity, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [randomUUID(), productId, inventory.on_hand_quantity, input.onHandQuantity, input.reason ?? null]
    );
    await connection.commit();
    return {
      productId: inventory.product_id,
      slug: inventory.slug,
      title: inventory.title,
      isActive: Boolean(inventory.is_active),
      onHandQuantity: input.onHandQuantity,
      reservedQuantity: inventory.reserved_quantity,
      availableQuantity: input.onHandQuantity - inventory.reserved_quantity,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function addAdminInventory(
  productId: string,
  input: { quantity: number; reason?: string }
): Promise<AdminInventoryItem> {
  const connection = await getMySqlPool().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<AdminInventoryRow[]>(
      `SELECT p.id AS product_id, p.slug, p.title, p.is_active,
              i.on_hand_quantity, i.reserved_quantity, i.updated_at
       FROM products AS p INNER JOIN inventory AS i ON i.product_id = p.id
       WHERE p.id = ? FOR UPDATE`,
      [productId]
    );
    const inventory = rows[0];
    if (!inventory) throw new Error("Product inventory was not found.");
    const nextQuantity = inventory.on_hand_quantity + input.quantity;
    await connection.execute("UPDATE inventory SET on_hand_quantity = ? WHERE product_id = ?", [nextQuantity, productId]);
    await connection.execute(
      `INSERT INTO inventory_adjustments (id, product_id, previous_on_hand_quantity, new_on_hand_quantity, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [randomUUID(), productId, inventory.on_hand_quantity, nextQuantity, input.reason ?? "库存入库"]
    );
    await connection.commit();
    return { productId: inventory.product_id, slug: inventory.slug, title: inventory.title, isActive: Boolean(inventory.is_active), onHandQuantity: nextQuantity, reservedQuantity: inventory.reserved_quantity, availableQuantity: nextQuantity - inventory.reserved_quantity, updatedAt: new Date().toISOString() };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

