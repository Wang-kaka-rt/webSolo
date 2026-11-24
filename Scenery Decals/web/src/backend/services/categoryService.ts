import "server-only";
import { z } from "zod";
import { createAdminCategory, deleteAdminCategory, listAdminCategories, listAdminCategoriesPage, updateAdminCategory } from "@/backend/repositories/categoryRepository";
const schema = z.object({ slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "分类标识只能使用小写英文、数字和连字符。").max(80), name: z.string().trim().min(1, "请填写英文分类名称。").max(120), nameZh: z.string().trim().min(1, "请填写中文分类名称。").max(120), nameKo: z.string().trim().min(1, "请填写韩文分类名称。").max(120), imageUrl: z.string().trim().max(500).default("") });
export class CategoryInputError extends Error { constructor(message: string) { super(message); this.name = "CategoryInputError"; } }
function parse(raw: unknown) { const result = schema.safeParse(raw); if (!result.success) throw new CategoryInputError(result.error.issues[0]?.message ?? "分类资料不正确。"); return result.data; }
export async function getAdminCategories() { return listAdminCategories(); }
export async function getAdminCategoriesPage(page: number, pageSize: number, search?: string) { return listAdminCategoriesPage({ page, pageSize, search }); }
export async function createCategory(raw: unknown) { return createAdminCategory(parse(raw)); }
export async function updateCategory(oldSlug: string, raw: unknown) { return updateAdminCategory(oldSlug, parse(raw)); }
export async function deleteCategory(slug: string) { return deleteAdminCategory(slug); }
