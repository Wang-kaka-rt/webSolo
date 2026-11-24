import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { getAdminCategories } from "@/backend/services/categoryService";
import { AdminProductForm } from "@/frontend/components/admin/AdminProductForm";
import { AdminShell } from "@/frontend/components/admin/AdminShell";
export default async function NewProductPage() { const cookieStore = await cookies(); if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin/login"); const categories = await getAdminCategories(); return <AdminShell showBreadcrumbs><h1 className="text-3xl font-extrabold tracking-tight">新增商品</h1><p className="mt-2 text-base text-slate-500">商品创建成功后，将自动创建对应的库存记录。</p><AdminProductForm categories={categories} /></AdminShell>; }
