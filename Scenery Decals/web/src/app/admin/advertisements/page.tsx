import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { getAdminHeroAdvertisement } from "@/backend/services/advertisementService";
import { AdminShell } from "@/frontend/components/admin/AdminShell";
import { HeroAdvertisementForm } from "@/frontend/components/admin/HeroAdvertisementForm";

export const dynamic = "force-dynamic";
export default async function AdvertisementPage() {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin/login");
  const advertisement = await getAdminHeroAdvertisement();
  if (!advertisement) return <AdminShell><h1 className="text-3xl font-extrabold">广告管理</h1><p className="mt-3 text-slate-500">广告数据尚未初始化，请执行数据库迁移。</p></AdminShell>;
  return <AdminShell><header><h1 className="text-3xl font-extrabold tracking-tight">广告管理</h1><p className="mt-2 text-base text-slate-500">管理首页主视觉广告；支持中、英、韩三种语言。</p></header><HeroAdvertisementForm initialAdvertisement={advertisement} /></AdminShell>;
}
