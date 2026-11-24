"use client";

import { useState } from "react";
import type { AdminInventoryItem } from "@/shared/types/reservation";

type AdjustmentMode = "add" | "edit";

export function AdminInventoryPanel({ initialInventory }: { initialInventory: AdminInventoryItem[] }) {
  const [inventory, setInventory] = useState(initialInventory);
  const [active, setActive] = useState<AdminInventoryItem | null>(null);
  const [mode, setMode] = useState<AdjustmentMode>("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isAdding = mode === "add";

  function openModal(item: AdminInventoryItem, nextMode: AdjustmentMode) {
    setActive(item); setMode(nextMode); setQuantity(nextMode === "edit" ? String(item.onHandQuantity) : ""); setReason(""); setError(null);
  }

  function closeModal() { if (!saving) setActive(null); }

  async function saveAdjustment() {
    if (!active) return;
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < (isAdding ? 1 : active.reservedQuantity)) {
      setError(isAdding ? "请输入至少 1 件的入库数量。" : `在库数量不能低于已预约数量（${active.reservedQuantity}）。`);
      return;
    }
    setSaving(true); setError(null);
    try {
      const response = await fetch(`/api/admin/inventory/${active.productId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isAdding ? { adjustmentQuantity: parsedQuantity, reason: reason.trim() } : { onHandQuantity: parsedQuantity, reason: reason.trim() }) });
      const result = (await response.json()) as { error?: string; inventory?: AdminInventoryItem };
      if (!response.ok || !result.inventory) throw new Error(result.error ?? "保存失败，请重试。");
      setInventory((current) => current.map((item) => item.productId === result.inventory!.productId ? result.inventory! : item));
      setActive(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存失败，请重试。");
    } finally { setSaving(false); }
  }

  return <>
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">商品</th>
              <th className="px-5 py-3 font-semibold">在库</th>
              <th className="px-5 py-3 font-semibold">已预约</th>
              <th className="px-5 py-3 font-semibold">可预约</th>
              <th className="px-5 py-3 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map((item) => (
              <tr key={item.productId}>
                <td className="px-5 py-4"><p className="font-medium text-slate-800">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.isActive ? "已上架" : "未上架"}</p></td>
                <td className="px-5 py-4 tabular-nums font-semibold">{item.onHandQuantity}</td>
                <td className="px-5 py-4 tabular-nums text-slate-600">{item.reservedQuantity}</td>
                <td className="px-5 py-4 tabular-nums font-semibold text-slate-800">{item.availableQuantity}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-sm bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700" onClick={() => openModal(item, "add")} type="button">增加库存</button>
                    <button className="rounded-sm border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => openModal(item, "edit")} type="button">编辑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
    {active && <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }} role="dialog">
      <section className="w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">{isAdding ? "增加库存" : "编辑库存"}</h2><p className="mt-1 text-sm text-slate-500">{active.title}</p></div><button aria-label="关闭" className="text-2xl leading-none text-slate-400 hover:text-slate-700" disabled={saving} onClick={closeModal} type="button">×</button></div>
        <div className="mt-5 grid grid-cols-3 gap-3 rounded-sm bg-slate-50 p-4 text-center"><div><p className="text-xs text-slate-500">当前在库</p><p className="mt-1 text-xl font-bold">{active.onHandQuantity}</p></div><div><p className="text-xs text-slate-500">已预约</p><p className="mt-1 text-xl font-bold">{active.reservedQuantity}</p></div><div><p className="text-xs text-slate-500">可预约</p><p className="mt-1 text-xl font-bold">{active.availableQuantity}</p></div></div>
        <label className="mt-5 block text-sm font-semibold text-slate-700">{isAdding ? "本次入库数量" : "调整后的在库数量"}<input autoFocus className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600" min={isAdding ? 1 : active.reservedQuantity} onChange={(event) => setQuantity(event.target.value)} required type="number" value={quantity} /></label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">调整原因（可选）<textarea className="mt-2 min-h-24 w-full rounded-sm border border-slate-300 px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600" maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder={isAdding ? "例如：新到货 20 件" : "例如：盘点后修正库存"} value={reason} /></label>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-3"><button className="rounded-sm border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" disabled={saving} onClick={closeModal} type="button">取消</button><button className="rounded-sm bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60" disabled={saving} onClick={saveAdjustment} type="button">{saving ? "保存中…" : isAdding ? "确认入库" : "保存修改"}</button></div>
      </section>
    </div>}
  </>;
}
