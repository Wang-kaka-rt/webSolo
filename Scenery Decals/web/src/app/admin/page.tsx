import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { getAdminReservations } from "@/backend/services/adminReservationService";
import { getAdminInventory } from "@/backend/services/inventoryService";
import { AdminShell } from "@/frontend/components/admin/AdminShell";
import { ExpireReservationsButton } from "@/frontend/components/admin/ExpireReservationsButton";

export const dynamic = "force-dynamic";

const statusLabel = { submitted: "新预约", notified: "已提醒", contacted: "已联系", confirmed: "已确认", fulfilled: "已完成", cancelled: "已取消", expired: "已过期", declined: "已拒绝" };
const statusColor = { submitted: "bg-blue-100 text-blue-700", notified: "bg-blue-100 text-blue-700", contacted: "bg-amber-100 text-amber-700", confirmed: "bg-emerald-100 text-emerald-700", fulfilled: "bg-emerald-100 text-emerald-700", cancelled: "bg-slate-100 text-slate-600", expired: "bg-slate-100 text-slate-600", declined: "bg-rose-100 text-rose-700" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin/login");
  const [reservations, inventory] = await Promise.all([getAdminReservations(), getAdminInventory()]);
  const newReservations = reservations.filter((item) => item.status === "submitted");
  const reservedInventory = inventory.reduce((total, item) => total + item.reservedQuantity, 0);

  return (
    <AdminShell>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">数据概览</h1>
          <p className="mt-2 text-base text-slate-500">{new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(new Date())}</p>
        </div>
        <ExpireReservationsButton />
      </header>
      <section className="mt-7 flex flex-col gap-4 rounded-md border border-blue-200 bg-blue-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-bold text-slate-800">{newReservations.length} 条新预约等待处理</p>
        <Link className="rounded-sm bg-blue-600 px-6 py-2.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-blue-700" href="/admin/reservations">查看预约</Link>
      </section>
      <section className="mt-7 grid gap-5 md:grid-cols-3">
        <article className="rounded-md border border-slate-200 bg-white p-6"><p className="text-sm font-semibold text-slate-600">总预约</p><p className="mt-3 text-5xl font-extrabold tracking-tight">{reservations.length}</p></article>
        <article className="rounded-md border border-slate-200 bg-white p-6"><p className="text-sm font-semibold text-slate-600">新预约</p><p className="mt-3 text-5xl font-extrabold tracking-tight">{newReservations.length}</p></article>
        <article className="rounded-md border border-slate-200 bg-white p-6"><p className="text-sm font-semibold text-slate-600">已预约库存</p><p className="mt-3 text-5xl font-extrabold tracking-tight">{reservedInventory}</p></article>
      </section>
      <section className="mt-7 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-5"><h2 className="text-xl font-extrabold">最近预约</h2><Link className="text-sm font-bold text-blue-600 hover:text-blue-700" href="/admin/reservations">查看全部</Link></div>
        {reservations.length === 0 ? <p className="border-t border-slate-100 px-6 py-12 text-center text-sm text-slate-500">还没有客户预约。</p> : <div className="overflow-x-auto border-t border-slate-100"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-bold text-slate-500"><tr><th className="px-5 py-3">编号</th><th className="px-5 py-3">客户</th><th className="px-5 py-3">商品</th><th className="px-5 py-3">联系方式</th><th className="px-5 py-3">状态</th><th className="px-5 py-3">到期时间</th></tr></thead><tbody className="divide-y divide-slate-100">{reservations.slice(0, 6).map((item) => <tr key={item.id}><td className="px-5 py-4 font-medium">{item.referenceNo}</td><td className="px-5 py-4 font-medium">{item.customerName}</td><td className="px-5 py-4">{item.items.map((product) => `${product.productTitle} × ${product.quantity}`).join("、")}</td><td className="px-5 py-4 text-slate-600">{item.email ?? item.phone ?? item.wechat ?? "—"}</td><td className="px-5 py-4"><span className={`rounded-sm px-2.5 py-1 text-xs font-bold ${statusColor[item.status]}`}>{statusLabel[item.status]}</span></td><td className="px-5 py-4 whitespace-nowrap text-slate-600">{formatDate(item.expiresAt)}</td></tr>)}</tbody></table></div>}
      </section>
    </AdminShell>
  );
}
