import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { getAdminProductById } from "@/backend/services/productService";
import { getAdminCategories } from "@/backend/services/categoryService";
import { AdminProductForm } from "@/frontend/components/admin/AdminProductForm";
import { AdminShell } from "@/frontend/components/admin/AdminShell";
export const dynamic = "force-dynamic";
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) { const cookieStore = await cookies(); if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin/login"); const { id } = await params; const [product, categories] = await Promise.all([getAdminProductById(id), getAdminCategories()]); if (!product) notFound(); return <AdminShell showBreadcrumbs><h1 className="text-3xl font-extrabold tracking-tight">编辑商品</h1><p className="mt-2 text-base text-slate-500">库存与价格可在商品管理列表中双击快速修改。</p><AdminProductForm categories={categories} product={product} /></AdminShell>; }
