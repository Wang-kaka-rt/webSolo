import "server-only";
import type { RowDataPacket } from "mysql2";
import { getMySqlPool } from "@/backend/db/mysql";
import type { Product } from "@/shared/types/store";
import type { Locale } from "@/frontend/context/LocaleContext";

interface Row extends RowDataPacket { id: string; slug: string; title: string; category: string; category_label: string; price: string; tag: "Hot" | "New" | null; image_url: string; description: string; sheet_count: string; dimensions: string; finishes_json: string | null; section: Product["section"]; }
export async function listPublicProducts(params: { category?: string | null; q?: string | null; section?: string | null; sort?: string | null; locale?: Locale }): Promise<Product[]> {
  const locale = params.locale ?? "en"; const suffix = locale === "zh" ? "_zh" : locale === "ko" ? "_ko" : "";
  const title = suffix ? `COALESCE(title${suffix}, title)` : "title"; const description = suffix ? `COALESCE(description${suffix}, description)` : "description"; const label = suffix ? `COALESCE(category_label${suffix}, category_label)` : "category_label";
  const conditions = ["is_active = TRUE"]; const values: string[] = [];
  if (params.category && params.category !== "all") { conditions.push("category = ?"); values.push(params.category); }
  if (params.q?.trim()) { conditions.push(`(${title} LIKE ? OR ${description} LIKE ?)`); values.push(`%${params.q.trim()}%`, `%${params.q.trim()}%`); }
  if (params.section === "best-sellers") conditions.push("section IN ('best-seller','both')"); if (params.section === "new-arrivals") conditions.push("section IN ('new-arrival','both')");
  const order = params.sort === "price-asc" ? "price ASC" : params.sort === "price-desc" ? "price DESC" : "created_at DESC";
  const [rows] = await getMySqlPool().execute<Row[]>(`SELECT id, slug, ${title} AS title, category, ${label} AS category_label, price, tag, image_url, ${description} AS description, sheet_count, dimensions, finishes_json, section FROM products WHERE ${conditions.join(" AND ")} ORDER BY ${order}`, values);
  return rows.map((row) => ({ id: row.id, slug: row.slug, title: row.title, category: row.category as Product["category"], categoryLabel: row.category_label, price: Number(row.price), rating: 0, reviewCount: "", rawReviewCount: 0, tag: row.tag, image: row.image_url, description: row.description, sheetCount: row.sheet_count, dimensions: row.dimensions, finishes: JSON.parse(row.finishes_json ?? "[]"), section: row.section, reviews: [] }));
}
