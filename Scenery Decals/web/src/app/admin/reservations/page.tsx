import Link from "next/link";
import { Search } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { getAdminReservationsPage } from "@/backend/services/adminReservationService";
import { AdminReservationsPanel } from "@/frontend/components/admin/AdminReservationsPanel";
import { AdminShell } from "@/frontend/components/admin/AdminShell";
import { ExpireReservationsButton } from "@/frontend/components/admin/ExpireReservationsButton";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin/login");

  const { page: rawPage, search: rawSearch } = await searchParams;
  const search = rawSearch?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
  const { items: reservations, total } = await getAdminReservationsPage(page, 10, search);
  const paginationPath = `/admin/reservations${search ? `?search=${encodeURIComponent(search)}` : ""}`;

  return <AdminShell>
    <header className="rounded-md border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,620px)_auto] lg:items-center">
        <div><h1 className="text-3xl font-extrabold tracking-tight">预约订单</h1><p className="mt-2 text-base text-slate-500">查看客户联系方式、记录跟进情况并更新预约状态。</p></div>
        <form action="/admin/reservations" className="flex w-full items-center gap-2"><label className="sr-only" htmlFor="reservation-search">搜索预约订单</label><div className="relative min-w-0 flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="w-full rounded-sm border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:bg-white focus:ring-2 focus:ring-violet-100" defaultValue={search} id="reservation-search" name="search" placeholder="搜索预约编号、客户、商品或联系方式" type="search" /></div><button className="shrink-0 rounded-sm border border-violet-600 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50" type="submit">搜索</button>{search && <Link className="shrink-0 rounded-sm px-2 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-violet-700" href="/admin/reservations">清除</Link>}</form>
        <ExpireReservationsButton />
      </div>
    </header>
    <div className="mt-7"><AdminReservationsPanel initialReservations={reservations} page={page} paginationPath={paginationPath} totalItems={total} /></div>
  </AdminShell>;
}
