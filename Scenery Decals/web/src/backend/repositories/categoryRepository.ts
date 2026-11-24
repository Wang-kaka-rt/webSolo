import "server-only";

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getMySqlPool } from "@/backend/db/mysql";
import type { AdminProductCategory } from "@/shared/types/productCategory";

export interface CategoryInput {
  slug: string;
  name: string;
  nameZh: string;
  nameKo: string;
  imageUrl: string;
}

function browserImageUrl(imageUrl: string | null) {
  if (!imageUrl) return "";
  return imageUrl.startsWith("/Foto/images/") ? `/api/media/${imageUrl.slice("/Foto/".length)}` : imageUrl;
}

interface CategoryRow extends RowDataPacket {
  slug: string;
  name: string;
  name_zh: string | null;
  name_ko: string | null;
  image_url: string | null;
  product_count: number;
}
interface CountRow extends RowDataPacket { total: number; }

export async function listAdminCategories(): Promise<AdminProductCategory[]> {
  const [rows] = await getMySqlPool().query<CategoryRow[]>(`
    SELECT c.slug, c.name, c.name_zh, c.name_ko, c.image_url, COUNT(p.id) AS product_count
    FROM product_categories c
    LEFT JOIN products p ON p.category = c.slug
    GROUP BY c.slug, c.name, c.name_zh, c.name_ko, c.image_url
    ORDER BY c.name
  `);
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    nameZh: row.name_zh ?? row.name,
    nameKo: row.name_ko ?? row.name,
    imageUrl: browserImageUrl(row.image_url),
    productCount: Number(row.product_count),
  }));
}

export async function listAdminCategoriesPage({ page, pageSize, search }: { page: number; pageSize: number; search?: string }) {
  const offset = (page - 1) * pageSize;
  const where = search ? " WHERE c.name LIKE ? OR c.name_zh LIKE ? OR c.name_ko LIKE ?" : "";
  const values = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
  const [[countRows], [rows]] = await Promise.all([
    getMySqlPool().execute<CountRow[]>(`SELECT COUNT(*) AS total FROM product_categories AS c${where}`, values),
    getMySqlPool().execute<CategoryRow[]>(`
      SELECT c.slug, c.name, c.name_zh, c.name_ko, c.image_url, COUNT(p.id) AS product_count
      FROM product_categories c
      LEFT JOIN products p ON p.category = c.slug
      ${where}
      GROUP BY c.slug, c.name, c.name_zh, c.name_ko, c.image_url
      ORDER BY c.name
      LIMIT ? OFFSET ?
    `, [...values, pageSize, offset]),
  ]);
  return {
    items: rows.map((row) => ({ slug: row.slug, name: row.name, nameZh: row.name_zh ?? row.name, nameKo: row.name_ko ?? row.name, imageUrl: browserImageUrl(row.image_url), productCount: Number(row.product_count) })),
    total: Number(countRows[0]?.total ?? 0),
  };
}

export async function createAdminCategory(input: CategoryInput) {
  await getMySqlPool().execute(
    "INSERT INTO product_categories (slug, name, name_zh, name_ko, image_url) VALUES (?, ?, ?, ?, ?)",
    [input.slug, input.name, input.nameZh, input.nameKo, input.imageUrl]
  );
  return input;
}

export async function updateAdminCategory(oldSlug: string, input: CategoryInput) {
  const connection = await getMySqlPool().getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.execute<CategoryRow[]>(
      "SELECT slug, name, name_zh, name_ko, image_url, 0 AS product_count FROM product_categories WHERE slug = ? FOR UPDATE",
      [oldSlug]
    );
    if (!existing[0]) return null;
    if (input.slug !== oldSlug) {
      const [duplicate] = await connection.execute<CategoryRow[]>(
        "SELECT slug, name, name_zh, name_ko, image_url, 0 AS product_count FROM product_categories WHERE slug = ? FOR UPDATE",
        [input.slug]
      );
      if (duplicate[0]) throw new Error("CATEGORY_SLUG_EXISTS");
      await connection.execute(
        "INSERT INTO product_categories (slug, name, name_zh, name_ko, image_url) VALUES (?, ?, ?, ?, ?)",
        [input.slug, input.name, input.nameZh, input.nameKo, input.imageUrl]
      );
      await connection.execute(
        "UPDATE products SET category = ?, category_label = ?, category_label_zh = ?, category_label_ko = ? WHERE category = ?",
        [input.slug, input.name, input.nameZh, input.nameKo, oldSlug]
      );
      await connection.execute("DELETE FROM product_categories WHERE slug = ?", [oldSlug]);
    } else {
      await connection.execute(
        "UPDATE product_categories SET name = ?, name_zh = ?, name_ko = ?, image_url = ? WHERE slug = ?",
        [input.name, input.nameZh, input.nameKo, input.imageUrl, oldSlug]
      );
      await connection.execute(
        "UPDATE products SET category_label = ?, category_label_zh = ?, category_label_ko = ? WHERE category = ?",
        [input.name, input.nameZh, input.nameKo, oldSlug]
      );
    }
    await connection.commit();
    return input;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteAdminCategory(slug: string) {
  const connection = await getMySqlPool().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<CategoryRow[]>(
      "SELECT c.slug, c.name, c.name_zh, c.name_ko, c.image_url, COUNT(p.id) AS product_count FROM product_categories c LEFT JOIN products p ON p.category = c.slug WHERE c.slug = ? GROUP BY c.slug, c.name, c.name_zh, c.name_ko, c.image_url FOR UPDATE",
      [slug]
    );
    if (!rows[0]) return false;
    if (Number(rows[0].product_count) > 0) throw new Error("CATEGORY_HAS_PRODUCTS");
    await connection.execute<ResultSetHeader>("DELETE FROM product_categories WHERE slug = ?", [slug]);
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
