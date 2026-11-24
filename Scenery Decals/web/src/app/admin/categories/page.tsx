import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { getAdminCategoriesPage } from "@/backend/services/categoryService";
import { AdminCategoryPanel } from "@/frontend/components/admin/AdminCategoryPanel";
import { AdminShell } from "@/frontend/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin/login");
  const { page: rawPage, search: rawSearch } = await searchParams;
  const search = rawSearch?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
  const { items: categories, total } = await getAdminCategoriesPage(page, 10, search);
  return <AdminShell><AdminCategoryPanel initialCategories={categories} page={page} search={search} totalItems={total} /></AdminShell>;
}
