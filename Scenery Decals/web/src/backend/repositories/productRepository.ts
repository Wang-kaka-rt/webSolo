import "server-only";

import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getMySqlPool, reconnectMySqlPool } from "@/backend/db/mysql";
import type { AdminProductItem, ProductSection } from "@/shared/types/productAdmin";

interface ProductRow extends RowDataPacket {
  id: string; product_code: number; slug: string; title: string; title_zh: string | null; title_ko: string | null; category: string; category_label: string; price: string | number;
  tag: string | null; image_url: string; images_json: string | string[] | null; description: string; description_zh: string | null; description_ko: string | null; sheet_count: string; dimensions: string;
  finishes_json: string | string[] | null; section: ProductSection; is_active: number; on_hand_quantity: number; reserved_quantity: number;
}

interface CountRow extends RowDataPacket { total: number; }

export interface ProductWriteInput {
  slug: string; title: string; titleZh: string; titleKo: string; category: string; categoryLabel: string; price: number; tag: string | null;
  imageUrl: string; imageUrls: string[]; description: string; descriptionZh: string; descriptionKo: string; sheetCount: string; dimensions: string; finishes: string[];
  section: ProductSection; isActive: boolean;
}

function toProduct(row: ProductRow): AdminProductItem {
  let finishes: string[] = [];
  if (Array.isArray(row.finishes_json)) finishes = row.finishes_json;
  else if (row.finishes_json) {
    try { finishes = JSON.parse(row.finishes_json) as string[]; } catch { finishes = []; }
  }
  let imageUrls: string[] = [];
  if (Array.isArray(row.images_json)) imageUrls = row.images_json;
  else if (row.images_json) { try { imageUrls = JSON.parse(row.images_json) as string[]; } catch { imageUrls = []; } }
  if (!imageUrls.length && row.image_url) imageUrls = [row.image_url];
  return { id: row.id, productCode: Number(row.product_code), slug: row.slug, title: row.title, titleZh: row.title_zh ?? "", titleKo: row.title_ko ?? "", category: row.category, categoryLabel: row.category_label,
    price: Number(row.price), tag: row.tag, imageUrl: imageUrls[0] ?? row.image_url, imageUrls, description: row.description, descriptionZh: row.description_zh ?? row.description, descriptionKo: row.description_ko ?? row.description,
    sheetCount: row.sheet_count, dimensions: row.dimensions, finishes, section: row.section,
    isActive: Boolean(row.is_active), onHandQuantity: row.on_hand_quantity, reservedQuantity: row.reserved_quantity };
}

const productSelect = `SELECT p.id, p.product_code, p.slug, p.title, p.title_zh, p.title_ko, p.category, p.category_label, p.price, p.tag, p.image_url, p.images_json,
  p.description, p.description_zh, p.description_ko, p.sheet_count, p.dimensions, p.finishes_json, p.section, p.is_active,
  i.on_hand_quantity, i.reserved_quantity FROM products p INNER JOIN inventory i ON i.product_id = p.id`;

async function queryProducts(sql: string, values: Array<string | number> = []) {
  try {
    return await getMySqlPool().execute<ProductRow[]>(sql, values);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (!isTransientDatabaseError(code)) throw error;
    await reconnectMySqlPool();
    await new Promise((resolve) => setTimeout(resolve, 150));
    return getMySqlPool().execute<ProductRow[]>(sql, values);
  }
}

function isTransientDatabaseError(code: string | undefined) {
  return code === "ECONNRESET" || code === "PROTOCOL_CONNECTION_LOST" || code === "EPIPE" || code === "ETIMEDOUT";
}

export async function listAdminProducts(): Promise<AdminProductItem[]> {
  const [rows] = await queryProducts(`${productSelect} ORDER BY p.product_code DESC`);
  return rows.map(toProduct);
}

export async function listAdminProductsPage({ page, pageSize, category, search }: { page: number; pageSize: number; category?: string; search?: string }) {
  const offset = (page - 1) * pageSize;
  const clauses: string[] = [];
  const values: Array<string | number> = [];
  if (category) { clauses.push("p.category = ?"); values.push(category); }
  if (search) {
    const term = `%${search}%`;
    clauses.push("(CAST(p.product_code AS CHAR) LIKE ? OR p.title_zh LIKE ? OR p.title_ko LIKE ? OR p.title LIKE ?)");
    values.push(term, term, term, term);
  }
  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const [[countRows], [rows]] = await Promise.all([
    getMySqlPool().execute<CountRow[]>(`SELECT COUNT(*) AS total FROM products AS p${where}`, values),
    queryProducts(`${productSelect}${where} ORDER BY p.product_code DESC LIMIT ? OFFSET ?`, [...values, pageSize, offset]),
  ]);
  return { items: rows.map(toProduct), total: Number(countRows[0]?.total ?? 0) };
}

export async function getAdminProduct(id: string): Promise<AdminProductItem | null> {
  const [rows] = await getMySqlPool().execute<ProductRow[]>(`${productSelect} WHERE p.id = ? LIMIT 1`, [id]);
  return rows[0] ? toProduct(rows[0]) : null;
}

export async function createAdminProduct(input: ProductWriteInput, initialStock: number): Promise<AdminProductItem> {
  const connection = await getMySqlPool().getConnection();
  const id = randomUUID();
  try {
    await connection.beginTransaction();
    const [created] = await connection.execute<ResultSetHeader>(`INSERT INTO products
      (id, slug, title, title_zh, title_ko, category, category_label, price, tag, image_url, images_json, description, description_zh, description_ko, sheet_count, dimensions, finishes_json, section, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, input.slug, input.title, input.titleZh, input.titleKo, input.category, input.categoryLabel, input.price, input.tag, input.imageUrls[0], JSON.stringify(input.imageUrls),
        input.description, input.descriptionZh, input.descriptionKo, input.sheetCount, input.dimensions, JSON.stringify(input.finishes), input.section, input.isActive]);
    await connection.execute("INSERT INTO inventory (product_id, on_hand_quantity, reserved_quantity) VALUES (?, ?, 0)", [id, initialStock]);
    await connection.commit();
    return { id, productCode: Number(created.insertId), ...input, onHandQuantity: initialStock, reservedQuantity: 0 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

export async function updateAdminProduct(id: string, input: ProductWriteInput): Promise<AdminProductItem | null> {
  const [result] = await getMySqlPool().execute<ResultSetHeader>(`UPDATE products SET slug = ?, title = ?, category = ?,
    title_zh = ?, title_ko = ?, category_label = ?, price = ?, tag = ?, image_url = ?, images_json = ?, description = ?, description_zh = ?, description_ko = ?, sheet_count = ?, dimensions = ?,
    finishes_json = ?, section = ?, is_active = ? WHERE id = ?`,
    [input.slug, input.title, input.category, input.titleZh, input.titleKo, input.categoryLabel, input.price, input.tag, input.imageUrls[0], JSON.stringify(input.imageUrls),
      input.description, input.descriptionZh, input.descriptionKo, input.sheetCount, input.dimensions, JSON.stringify(input.finishes), input.section, input.isActive, id]);
  if (result.affectedRows !== 1) return null;
  return getAdminProduct(id);
}

export async function updateAdminProductImage(id: string, imageUrl: string): Promise<AdminProductItem | null> {
  const [result] = await getMySqlPool().execute<ResultSetHeader>("UPDATE products SET image_url = ? WHERE id = ?", [imageUrl, id]);
  if (result.affectedRows !== 1) return null;
  return getAdminProduct(id);
}

export async function updateAdminProductPrice(id: string, price: number): Promise<AdminProductItem | null> {
  const [result] = await getMySqlPool().execute<ResultSetHeader>("UPDATE products SET price = ? WHERE id = ?", [price, id]);
  if (result.affectedRows !== 1) return null;
  return getAdminProduct(id);
}
