import type { RowDataPacket } from "mysql2";
import { getMySqlPool } from "./mysql";

export async function expireOpenReservations(now = new Date()): Promise<number> {
  const connection = await getMySqlPool().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<Array<RowDataPacket & { id: string }>>(
      `SELECT id FROM reservations
       WHERE status IN ('submitted', 'notified', 'contacted', 'confirmed')
         AND expires_at <= ?
       FOR UPDATE`,
      [now]
    );
    for (const row of rows) {
      await connection.execute(
        `UPDATE inventory AS inventory
         INNER JOIN reservation_items AS item ON item.product_id = inventory.product_id
         SET inventory.reserved_quantity = GREATEST(0, inventory.reserved_quantity - item.quantity)
         WHERE item.reservation_id = ?`,
        [row.id]
      );
      await connection.execute("UPDATE reservations SET status = 'expired' WHERE id = ?", [row.id]);
    }
    await connection.commit();
    return rows.length;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
