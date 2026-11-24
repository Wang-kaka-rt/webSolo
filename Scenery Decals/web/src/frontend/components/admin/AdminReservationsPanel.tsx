"use client";

import { useEffect, useState } from "react";
import { AdminTablePagination } from "@/frontend/components/admin/AdminTablePagination";
import type { AdminReservationItem, ReservationStatus } from "@/shared/types/reservation";

const statusLabels: Record<ReservationStatus, string> = { submitted: "新预约", notified: "已提醒", contacted: "已处理", confirmed: "已确认", fulfilled: "已完成", cancelled: "已取消", expired: "已过期", declined: "已拒绝" };
const statusOptions: ReservationStatus[] = ["submitted", "notified", "contacted", "confirmed", "fulfilled", "declined", "cancelled", "expired"];
const handledStatuses: ReservationStatus[] = ["contacted", "confirmed", "fulfilled", "cancelled", "declined", "expired"];

function formatDate(value: string) { return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function contactsOf(reservation: AdminReservationItem) {
  return [
    reservation.email && { type: "邮箱", value: reservation.email },
    reservation.kakaoTalk && { type: "KakaoTalk", value: reservation.kakaoTalk },
    reservation.whatsapp && { type: "WhatsApp", value: reservation.whatsapp },
    reservation.phone && { type: "电话", value: reservation.phone },
    reservation.wechat && { type: "微信", value: reservation.wechat },
  ].filter((item): item is { type: string; value: string } => Boolean(item));
}

export function AdminReservationsPanel({ initialReservations, page, paginationPath, totalItems }: { initialReservations: AdminReservationItem[]; page: number; paginationPath: string; totalItems: number }) {
  const [reservations, setReservations] = useState(initialReservations);
  const [active, setActive] = useState<AdminReservationItem | null>(null);
  const [status, setStatus] = useState<ReservationStatus>("submitted");
  const [adminNote, setAdminNote] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { setReservations(initialReservations); }, [initialReservations]);

  async function save(reservation: AdminReservationItem, nextStatus: ReservationStatus, nextNote = reservation.adminNote ?? "") {
    setSavingId(reservation.id); setMessage(null);
    try {
      const response = await fetch(`/api/admin/reservations/${reservation.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus, adminNote: nextNote }) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "保存失败，请重试。");
      const updated = { ...reservation, status: nextStatus, adminNote: nextNote || null };
      setReservations((current) => current.map((item) => item.id === reservation.id ? updated : item));
      setActive((current) => current?.id === reservation.id ? updated : current);
      setMessage(`${reservation.referenceNo} 已保存。`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存失败，请重试。"); }
    finally { setSavingId(null); }
  }

  function openDetails(reservation: AdminReservationItem) { setActive(reservation); setStatus(reservation.status); setAdminNote(reservation.adminNote ?? ""); }

  if (reservations.length === 0) return <section className="rounded-md border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">暂时没有预约记录。</section>;

  return <section className="space-y-4">
    {message && <p className="rounded-sm bg-violet-50 px-3 py-2 text-sm text-violet-800">{message}</p>}
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm">
      <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="whitespace-nowrap px-5 py-3 font-semibold">预约编号</th><th className="whitespace-nowrap px-5 py-3 font-semibold">客户</th><th className="px-5 py-3 font-semibold">预约商品</th><th className="px-5 py-3 font-semibold">联系方式</th><th className="whitespace-nowrap px-5 py-3 font-semibold">提交时间</th><th className="whitespace-nowrap px-5 py-3 font-semibold">状态</th><th className="px-5 py-3 text-right font-semibold">操作</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{reservations.map((reservation) => {
        const contacts = contactsOf(reservation);
        return <tr key={reservation.id}>
          <td className="whitespace-nowrap px-5 py-4 font-mono text-sm font-semibold text-violet-700">{reservation.referenceNo}</td>
          <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">{reservation.customerName}</td>
          <td className="min-w-64 px-5 py-4 text-slate-600">{reservation.items.map((item) => `${item.productTitle}${item.finish ? ` · ${item.finish}` : ""} × ${item.quantity}`).join("；")}</td>
          <td className="min-w-48 px-5 py-4 text-slate-600">{contacts.length ? `${contacts[0].type}：${contacts[0].value}` : "未提供"}</td>
          <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(reservation.createdAt)}</td>
          <td className="whitespace-nowrap px-5 py-4"><span className="inline-flex rounded-sm bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{statusLabels[reservation.status]}</span></td>
          <td className="whitespace-nowrap px-5 py-4 text-right"><div className="flex justify-end gap-2"><button className="rounded-sm border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-violet-400 hover:text-violet-700" onClick={() => openDetails(reservation)} type="button">详情</button><button className="rounded-sm bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={savingId === reservation.id || handledStatuses.includes(reservation.status)} onClick={() => void save(reservation, "contacted")} type="button">已处理</button></div></td>
        </tr>;
      })}</tbody>
    </table></div><AdminTablePagination currentPage={page} hrefForPage={(nextPage) => `${paginationPath}${paginationPath.includes("?") ? "&" : "?"}page=${nextPage}`} totalItems={totalItems} /></section>
    {active && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onClick={() => setActive(null)} role="dialog" aria-modal="true" aria-label="预约详情"><div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4"><div><p className="font-mono text-sm font-semibold text-violet-700">{active.referenceNo}</p><h2 className="mt-1 text-xl font-bold">预约详情 · {active.customerName}</h2><p className="mt-1 text-sm text-slate-500">提交于 {formatDate(active.createdAt)} · 到期 {formatDate(active.expiresAt)}</p></div><button aria-label="关闭" className="text-2xl leading-none text-slate-400 hover:text-slate-700" onClick={() => setActive(null)} type="button">×</button></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">预约商品</h3><ul className="mt-2 space-y-2 text-sm text-slate-700">{active.items.map((item, index) => <li key={`${item.productTitle}-${index}`}>{item.productTitle}{item.finish ? ` · ${item.finish}` : ""} × {item.quantity}</li>)}</ul></div><div><h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">联系方式</h3><div className="mt-2 space-y-2 text-sm text-slate-700">{contactsOf(active).map((contact) => <p key={`${contact.type}-${contact.value}`}><span className="font-semibold text-slate-900">{contact.type}：</span>{contact.value}</p>)}</div></div><div className="sm:col-span-2"><h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">客户备注</h3><p className="mt-2 min-h-10 rounded-sm bg-slate-50 p-3 text-sm text-slate-700">{active.customerNote || "无"}</p></div><div className="sm:col-span-2"><label className="block text-sm font-semibold text-slate-700">处理状态<select className="mt-2 block w-full rounded-sm border border-slate-300 bg-white px-3 py-2" onChange={(event) => setStatus(event.target.value as ReservationStatus)} value={status}>{statusOptions.map((option) => <option key={option} value={option}>{statusLabels[option]}</option>)}</select></label><label className="mt-4 block text-sm font-semibold text-slate-700">内部备注<textarea className="mt-2 min-h-24 w-full rounded-sm border border-slate-300 p-3 font-normal outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600" onChange={(event) => setAdminNote(event.target.value)} placeholder="记录客服联系结果或后续安排（仅后台可见）" value={adminNote} /></label></div></div><div className="mt-6 flex justify-end gap-3"><button className="rounded-sm border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" onClick={() => setActive(null)} type="button">关闭</button><button className="rounded-sm bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={savingId === active.id} onClick={() => void save(active, status, adminNote)} type="button">{savingId === active.id ? "保存中…" : "保存变更"}</button></div></div></div>}
  </section>;
}
