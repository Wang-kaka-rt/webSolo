import "server-only";

import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { getMySqlPool } from "@/backend/db/mysql";
import type { CartItem, CartState, FinishOption, OrderConfirmation, Product, StickerFinish } from "@/shared/types/store";

export type StoreLocale = "zh" | "en" | "ko";
const FREE_SHIPPING_THRESHOLD = 50;

interface StoreProductRow extends RowDataPacket {
  id: string; slug: string; title: string; title_zh: string | null; title_ko: string | null;
  category: string; category_label: string; category_label_zh: string | null; category_label_ko: string | null;
  price: string | number; image_url: string; images_json: string | string[] | null; description: string; description_zh: string | null; description_ko: string | null;
  sheet_count: string; dimensions: string; finishes_json: string | string[] | null; section: "best-seller" | "new-arrival" | "both"; on_hand_quantity: number; reserved_quantity: number;
}
interface StoreCategoryRow extends RowDataPacket {
  slug: string; name: string; name_zh: string | null; name_ko: string | null; image_url: string | null; product_count: number;
}
export interface StoreCategory {
  slug: string; name: string; image: string; itemCount: number; bgColor: string; accentColor: string;
}

const colors = [
  ["#FFEDE4", "#F291AC"], ["#F0E9FB", "#9D84D4"], ["#FCEAF2", "#EC7FA1"],
  ["#E7F2FE", "#7FAEE6"], ["#FCE9EE", "#D47A8D"], ["#EEF3E2", "#8BA86B"],
] as const;
const cartStore = new Map<string, CartItem[]>();
const orderStore = new Map<string, OrderConfirmation[]>();

function browserImageUrl(value: string | null) {
  if (!value) return "";
  return value.startsWith("/Foto/images/") ? `/api/media/${value.slice("/Foto/".length)}` : value;
}
function localized<T>(locale: StoreLocale, english: T, chinese: T | null, korean: T | null) {
  return locale === "zh" ? chinese ?? english : locale === "ko" ? korean ?? english : english;
}
function parseFinishes(value: StoreProductRow["finishes_json"]): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try { return JSON.parse(value) as string[]; } catch { return []; }
}
function parseImages(value: StoreProductRow["images_json"], fallback: string) {
  if (Array.isArray(value)) return value.map(browserImageUrl);
  if (value) { try { return (JSON.parse(value) as string[]).map(browserImageUrl); } catch {} }
  return fallback ? [browserImageUrl(fallback)] : [];
}
function toProduct(row: StoreProductRow, locale: StoreLocale, finishLabels: Record<string, string>): Product {
  return {
    id: row.id, slug: row.slug,
    title: localized(locale, row.title, row.title_zh, row.title_ko),
    category: row.category,
    categoryLabel: localized(locale, row.category_label, row.category_label_zh, row.category_label_ko),
    price: Number(row.price), image: parseImages(row.images_json, row.image_url)[0] ?? browserImageUrl(row.image_url), images: parseImages(row.images_json, row.image_url),
    description: localized(locale, row.description, row.description_zh, row.description_ko),
    sheetCount: row.sheet_count, dimensions: row.dimensions, finishes: parseFinishes(row.finishes_json), finishLabels, section: row.section, availableQuantity: Math.max(0, Number(row.on_hand_quantity) - Number(row.reserved_quantity)),
    rating: 0, reviewCount: "0", rawReviewCount: 0, reviews: [],
  };
}

const productSelect = `SELECT p.id, p.slug, p.title, p.title_zh, p.title_ko, p.category, p.category_label, p.category_label_zh, p.category_label_ko,
 p.price, p.image_url, p.images_json, p.description, p.description_zh, p.description_ko, p.sheet_count, p.dimensions, p.finishes_json, p.section,
 COALESCE(i.on_hand_quantity, 0) AS on_hand_quantity, COALESCE(i.reserved_quantity, 0) AS reserved_quantity
 FROM products p LEFT JOIN inventory i ON i.product_id = p.id WHERE p.is_active = TRUE`;

export async function listStoreCategories(locale: StoreLocale = "en"): Promise<StoreCategory[]> {
  const [rows] = await getMySqlPool().query<StoreCategoryRow[]>(`
    SELECT c.slug, c.name, c.name_zh, c.name_ko, c.image_url, COUNT(p.id) AS product_count
    FROM product_categories c LEFT JOIN products p ON p.category = c.slug AND p.is_active = TRUE
    GROUP BY c.slug, c.name, c.name_zh, c.name_ko, c.image_url ORDER BY c.name
  `);
  return rows.map((row, index) => ({
    slug: row.slug, name: localized(locale, row.name, row.name_zh, row.name_ko), image: browserImageUrl(row.image_url),
    itemCount: Number(row.product_count), bgColor: colors[index % colors.length][0], accentColor: colors[index % colors.length][1],
  }));
}

async function getFinishLabels(locale: StoreLocale): Promise<Record<string, string>> {
  const column = locale === "zh" ? "name_zh" : locale === "ko" ? "name_ko" : "name";
  const [rows] = await getMySqlPool().query<Array<RowDataPacket & { code: string; label: string }>>(`SELECT code, ${column} AS label FROM product_finishes`);
  return Object.fromEntries(rows.map((row) => [row.code, row.label]));
}

export async function listStoreFinishes(locale: StoreLocale = "en"): Promise<FinishOption[]> {
  const column = locale === "zh" ? "name_zh" : locale === "ko" ? "name_ko" : "name";
  const [rows] = await getMySqlPool().query<Array<RowDataPacket & { code: string; label: string }>>(
    `SELECT f.code, ${column} AS label FROM product_finishes f
     WHERE EXISTS (SELECT 1 FROM products p WHERE p.is_active = TRUE AND JSON_CONTAINS(p.finishes_json, JSON_QUOTE(f.code)))
     ORDER BY label`
  );
  return rows.map((row) => ({ id: row.code, label: row.label }));
}

export async function getStoreCategory(slug: string, locale: StoreLocale = "en") {
  return (await listStoreCategories(locale)).find((category) => category.slug === slug) ?? null;
}

export async function listProducts(params: { category?: string | null; q?: string | null; section?: string | null; sort?: string | null; finish?: string | null; locale?: StoreLocale }): Promise<Product[]> {
  const locale = params.locale ?? "en";
  const clauses = ["p.is_active = TRUE"];
  const values: string[] = [];
  if (params.category && params.category !== "all") { clauses.push("p.category = ?"); values.push(params.category); }
  if (params.section === "best-sellers") clauses.push("p.section IN ('best-seller', 'both')");
  if (params.section === "new-arrivals") clauses.push("p.section IN ('new-arrival', 'both')");
  if (params.finish && params.finish !== "all") { clauses.push("JSON_CONTAINS(p.finishes_json, JSON_QUOTE(?))"); values.push(params.finish); }
  if (params.q?.trim()) { clauses.push("(CAST(p.product_code AS CHAR) LIKE ? OR p.title LIKE ? OR p.title_zh LIKE ? OR p.title_ko LIKE ? OR p.description LIKE ? OR p.description_zh LIKE ? OR p.description_ko LIKE ?)"); const needle = `%${params.q.trim()}%`; values.push(needle, needle, needle, needle, needle, needle, needle); }
  const order = params.sort === "price-asc" ? "p.price ASC" : params.sort === "price-desc" ? "p.price DESC" : "p.created_at DESC";
  const [[rows], finishLabels] = await Promise.all([
    getMySqlPool().execute<StoreProductRow[]>(`${productSelect} AND ${clauses.join(" AND ")} ORDER BY ${order}`, values),
    getFinishLabels(locale),
  ]);
  return rows.map((row) => toProduct(row, locale, finishLabels));
}

export async function getProductById(id: string, locale: StoreLocale = "en") {
  const [[rows], finishLabels] = await Promise.all([getMySqlPool().execute<StoreProductRow[]>(`${productSelect} AND p.id = ? LIMIT 1`, [id]), getFinishLabels(locale)]);
  return rows[0] ? toProduct(rows[0], locale, finishLabels) : undefined;
}
export async function getProductBySlug(slug: string, locale: StoreLocale = "en") {
  const [[rows], finishLabels] = await Promise.all([getMySqlPool().execute<StoreProductRow[]>(`${productSelect} AND p.slug = ? LIMIT 1`, [slug]), getFinishLabels(locale)]);
  return rows[0] ? toProduct(rows[0], locale, finishLabels) : undefined;
}
export async function getRelatedProducts(product: Product, limit = 4, locale: StoreLocale = "en") {
  const [[rows], finishLabels] = await Promise.all([getMySqlPool().execute<StoreProductRow[]>(`${productSelect} AND p.id <> ? ORDER BY (p.category = ?) DESC, p.created_at DESC LIMIT ?`, [product.id, product.category, limit]), getFinishLabels(locale)]);
  return rows.map((row) => toProduct(row, locale, finishLabels));
}

export function buildCartState(items: CartItem[]): CartState {
  const subtotal = Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { items, subtotal, freeShippingThreshold: FREE_SHIPPING_THRESHOLD, qualifiesFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD, totalCount };
}
export function getCart(sessionId: string) { return buildCartState(cartStore.get(sessionId) ?? []); }
export async function addToCart(sessionId: string, productId: string, finish?: StickerFinish, quantity = 1) {
  const product = await getProductById(productId);
  if (!product) return null;
  const selectedFinish = finish ?? product.finishes[0] ?? "";
  const current = [...(cartStore.get(sessionId) ?? [])];
  const existingIndex = current.findIndex((item) => item.productId === productId && item.finish === selectedFinish);
  if (existingIndex >= 0) current[existingIndex] = { ...current[existingIndex], quantity: current[existingIndex].quantity + Math.max(1, quantity) };
  else current.push({ productId: product.id, title: product.title, price: product.price, image: product.image, finish: selectedFinish, quantity: Math.max(1, quantity) });
  cartStore.set(sessionId, current);
  return buildCartState(current);
}
export function updateCartItem(sessionId: string, productId: string, finish: StickerFinish, quantity: number) {
  const current = [...(cartStore.get(sessionId) ?? [])];
  const updated = quantity <= 0 ? current.filter((item) => !(item.productId === productId && item.finish === finish)) : current.map((item) => item.productId === productId && item.finish === finish ? { ...item, quantity } : item);
  cartStore.set(sessionId, updated); return buildCartState(updated);
}
export function clearCart(sessionId: string) { cartStore.set(sessionId, []); return getCart(sessionId); }
export function getOrders(sessionId: string) { return orderStore.get(sessionId) ?? []; }
export function placeOrder(sessionId: string, customer: { name: string; email: string; address: string }) {
  const cart = getCart(sessionId); if (!cart.items.length) return null;
  const shippingFee = cart.qualifiesFreeShipping ? 0 : 4.99;
  const order: OrderConfirmation = { orderId: `PG-${randomUUID().slice(0, 8).toUpperCase()}`, customerName: customer.name.trim(), email: customer.email.trim(), address: customer.address.trim(), items: structuredClone(cart.items), subtotal: cart.subtotal, shippingFee, total: Number((cart.subtotal + shippingFee).toFixed(2)), estimatedDelivery: "3–5 business days", createdAt: new Date().toISOString() };
  orderStore.set(sessionId, [order, ...getOrders(sessionId)]); clearCart(sessionId); return order;
}
