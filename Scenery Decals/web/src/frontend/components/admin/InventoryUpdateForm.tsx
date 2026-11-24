"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminInventoryItem } from "@/shared/types/reservation";

export function InventoryUpdateForm({ item, mode }: { item: AdminInventoryItem; mode: "add" | "edit" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isAdding = mode === "add";

  async function submit(formData: FormData) {
    setSaving(true); setError(null);
    const reason = String(formData.get("reason") ?? "").trim();
    const value = Number(formData.get(isAdding ? "adjustmentQuantity" : "onHandQuantity"));
    try {
      const response = await fetch(`/api/admin/inventory/${item.productId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isAdding ? { adjustmentQuantity: value, reason } : { onHandQuantity: value, reason }) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "保存失败，请重试。");
      router.push("/admin/inventory"); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "保存失败，请重试。"); }
    finally { setSaving(false); }
  }

  return <form action={submit} className="mt-7 max-w-2xl space-y-5 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
    <div><p className="text-sm font-medium text-slate-500">商品</p><p className="mt-1 text-lg font-bold text-slate-900">{item.title}</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><div><p className="text-sm text-slate-500">当前在库</p><p className="mt-1 text-2xl font-bold">{item.onHandQuantity}</p></div><div><p className="text-sm text-slate-500">已预约</p><p className="mt-1 text-2xl font-bold">{item.reservedQuantity}</p></div><div><p className="text-sm text-slate-500">当前可预约</p><p className="mt-1 text-2xl font-bold">{item.availableQuantity}</p></div></div>
    <label className="block text-sm font-semibold text-slate-700">{isAdding ? "增加库存数量" : "调整后的在库数量"}<input className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600" defaultValue={isAdding ? "" : item.onHandQuantity} min={isAdding ? 1 : item.reservedQuantity} name={isAdding ? "adjustmentQuantity" : "onHandQuantity"} required type="number" /></label>
    <label className="block text-sm font-semibold text-slate-700">调整原因（可选）<textarea className="mt-2 min-h-24 w-full rounded-sm border border-slate-300 px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600" maxLength={500} name="reason" placeholder={isAdding ? "例如：新到货 20 件" : "例如：盘点后修正库存"} /></label>
    {error && <p className="text-sm text-rose-600">{error}</p>}
    <div className="flex justify-end gap-3"><button className="rounded-sm border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" onClick={() => router.back()} type="button">取消</button><button className="rounded-sm bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={saving} type="submit">{saving ? "保存中…" : isAdding ? "确认入库" : "保存修改"}</button></div>
  </form>;
}
