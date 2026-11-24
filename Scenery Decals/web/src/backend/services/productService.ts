import "server-only";

import { z } from "zod";
import { createAdminProduct, getAdminProduct, listAdminProducts, listAdminProductsPage, updateAdminProduct, updateAdminProductImage, updateAdminProductPrice, type ProductWriteInput } from "@/backend/repositories/productRepository";

const productSchema = z.object({
  title: z.string().trim().min(2, "请填写商品名称。").max(255),
  titleZh: z.string().trim().min(1, "请填写中文商品名称。").max(255), titleKo: z.string().trim().min(1, "请填写韩文商品名称。").max(255),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "商品链接只能使用小写英文、数字和连字符。").max(160),
  category: z.string().trim().min(1, "请填写分类标识。").max(80),
  categoryLabel: z.string().trim().min(1, "请填写分类名称。").max(120),
  price: z.coerce.number().min(0, "价格不能小于 0。").max(999999),
  imageUrl: z.string().trim().min(1, "请填写商品图片地址。").max(500),
  imageUrls: z.array(z.string().trim().min(1).max(500)).min(1, "请至少上传一张商品图片。").max(12),
  description: z.string().trim().min(1, "请填写商品描述。").max(10000),
  descriptionZh: z.string().trim().min(1, "请填写中文商品描述。").max(10000), descriptionKo: z.string().trim().min(1, "请填写韩文商品描述。").max(10000),
  sheetCount: z.string().trim().max(120), dimensions: z.string().trim().max(120),
  finishes: z.array(z.string().trim().min(1).max(80)).min(1, "至少填写一种材质或工艺。").max(10),
  section: z.enum(["best-seller", "new-arrival", "both"]), isActive: z.boolean(),
});
const createSchema = productSchema.extend({ initialStock: z.coerce.number().int().min(0).max(100000) });
const quickPriceSchema = z.object({ price: z.coerce.number().min(0, "价格不能小于 0。").max(999999, "价格不能超过 999999。") });

export class ProductInputError extends Error { constructor(message: string) { super(message); this.name = "ProductInputError"; } }
function parseProduct(raw: unknown) {
  const result = productSchema.safeParse(raw);
  if (!result.success) throw new ProductInputError(result.error.issues[0]?.message ?? "商品资料不正确。");
  return result.data;
}
function parseCreateProduct(raw: unknown) {
  const result = createSchema.safeParse(raw);
  if (!result.success) throw new ProductInputError(result.error.issues[0]?.message ?? "商品资料不正确。");
  return result.data;
}
export async function getAdminProducts() { return listAdminProducts(); }
export async function getAdminProductsPage(page: number, pageSize: number, category?: string, search?: string) { return listAdminProductsPage({ page, pageSize, category, search }); }
export async function getAdminProductById(id: string) { return getAdminProduct(id); }
export async function createProduct(raw: unknown) {
  const { initialStock, ...input } = parseCreateProduct(raw);
  return createAdminProduct(input as ProductWriteInput, initialStock);
}
export async function updateProduct(id: string, raw: unknown) { return updateAdminProduct(id, parseProduct(raw) as ProductWriteInput); }
export async function saveProductImage(id: string, imageUrl: string) { return updateAdminProductImage(id, imageUrl); }
export async function saveProductPrice(id: string, raw: unknown) {
  const parsed = quickPriceSchema.safeParse(raw);
  if (!parsed.success) throw new ProductInputError(parsed.error.issues[0]?.message ?? "价格不正确。");
  return updateAdminProductPrice(id, parsed.data.price);
}
