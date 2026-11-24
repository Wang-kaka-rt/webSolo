"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminTablePagination } from "@/frontend/components/admin/AdminTablePagination";
import type { AdminProductItem } from "@/shared/types/productAdmin";

type QuickEditField = "price" | "inventory";

function mainImageUrl(imageUrl: string) {
  return imageUrl.startsWith("/Foto/images/")
    ? `/api/media/${imageUrl.slice("/Foto/".length)}`
    : imageUrl;
}

function productName(product: AdminProductItem) {
  return [product.titleZh, product.titleKo, product.title].find((name) => Boolean(name.trim())) ?? "未命名商品";
}

export function AdminProductPanel({ products: initialProducts, page, totalItems, paginationPath }: { products: AdminProductItem[]; page: number; totalItems: number; paginationPath: string }) {
  const [products, setProducts] = useState(initialProducts);
  const [active, setActive] = useState<{ product: AdminProductItem; field: QuickEditField } | null>(null);
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setProducts(initialProducts); }, [initialProducts]);

  function openQuickEdit(product: AdminProductItem, field: QuickEditField) {
    setActive({ product, field });
    setValue(field === "price" ? String(product.price) : String(product.onHandQuantity));
    setReason("");
    setError(null);
  }

  function closeQuickEdit() { if (!saving) setActive(null); }

  async function saveQuickEdit() {
    if (!active) return;
    const numericValue = Number(value);
    const isInventory = active.field === "inventory";
    if (!Number.isFinite(numericValue) || numericValue < (isInventory ? active.product.reservedQuantity : 0) || (isInventory && !Number.isInteger(numericValue))) {
      setError(isInventory ? `库存必须是整数，且不能低于已预约数量（${active.product.reservedQuantity}）。` : "请输入大于或等于 0 的有效价格。");
      return;
    }
    setSaving(true); setError(null);
    try {
      if (isInventory) {
        const response = await fetch(`/api/admin/inventory/${active.product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onHandQuantity: numericValue, reason: reason.trim() }) });
        const result = (await response.json()) as { error?: string; inventory?: { onHandQuantity: number; reservedQuantity: number } };
        if (!response.ok || !result.inventory) throw new Error(result.error ?? "库存保存失败，请重试。");
        setProducts((current) => current.map((product) => product.id === active.product.id ? { ...product, onHandQuantity: result.inventory!.onHandQuantity, reservedQuantity: result.inventory!.reservedQuantity } : product));
      } else {
        const response = await fetch(`/api/admin/products/${active.product.id}/quick-update`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ price: numericValue }) });
        const result = (await response.json()) as { error?: string; product?: AdminProductItem };
        if (!response.ok || !result.product) throw new Error(result.error ?? "价格保存失败，请重试。");
        setProducts((current) => current.map((product) => product.id === result.product!.id ? result.product! : product));
      }
      setActive(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存失败，请重试。");
    } finally { setSaving(false); }
  }

  if (products.length === 0) return <section className="rounded-md border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><p className="font-semibold text-slate-800">还没有商品</p><p className="mt-2 text-sm text-slate-500">创建第一个商品后，系统会自动生成库存记录。</p><Link className="mt-5 inline-flex rounded-sm bg-violet-600 px-4 py-2 text-sm font-semibold text-white" href="/admin/products/new">新增商品</Link></section>;

  const isInventory = active?.field === "inventory";
  return <>
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm">
      <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 text-center font-semibold">商品编号</th><th className="px-5 py-3 font-semibold">主图</th><th className="px-5 py-3 font-semibold">商品</th><th className="px-5 py-3 font-semibold">分类</th><th className="px-5 py-3 font-semibold">价格</th><th className="px-5 py-3 font-semibold">在库 / 可预约</th><th className="px-5 py-3 font-semibold">状态</th><th className="px-5 py-3 text-right font-semibold">操作</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{products.map((product) => <tr key={product.id}>
        <td className="px-5 py-4 text-center tabular-nums font-medium text-slate-700">{product.productCode}</td>
        <td className="px-5 py-3"><div className="h-14 w-14 overflow-hidden rounded-md border border-slate-200 bg-slate-50"><img src={mainImageUrl(product.imageUrl)} alt={`${product.title} 主图`} className="h-full w-full object-cover" /></div></td>
        <td className="px-5 py-4"><p className="font-semibold text-slate-800">{productName(product)}</p><p className="mt-1 text-xs text-slate-400">/{product.slug}</p></td><td className="px-5 py-4 text-slate-600">{product.categoryLabel}</td>
        <td className="px-5 py-4 tabular-nums text-slate-700"><button type="button" title="双击修改价格" onDoubleClick={() => openQuickEdit(product, "price")} className="cursor-pointer rounded-sm px-1 py-0.5 transition hover:bg-violet-50 hover:text-violet-700">${product.price.toFixed(2)}</button></td>
        <td className="px-5 py-4 tabular-nums"><button type="button" title="双击修改库存" onDoubleClick={() => openQuickEdit(product, "inventory")} className="cursor-pointer rounded-sm px-1 py-0.5 transition hover:bg-violet-50"><span className="font-semibold">{product.onHandQuantity}</span><span className="text-slate-400"> / {product.onHandQuantity - product.reservedQuantity}</span></button></td>
        <td className="px-5 py-4"><span className={`inline-flex rounded-sm px-2 py-1 text-xs font-semibold ${product.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{product.isActive ? "已上架" : "未上架"}</span></td><td className="px-5 py-4 text-right"><Link className="rounded-sm border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" href={`/admin/products/${product.id}/edit`}>编辑</Link></td>
      </tr>)}</tbody>
    </table></div><AdminTablePagination currentPage={page} hrefForPage={(nextPage) => `${paginationPath}${paginationPath.includes("?") ? "&" : "?"}page=${nextPage}`} totalItems={totalItems} /></section>
    {active && <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeQuickEdit(); }} role="dialog"><section className="w-full max-w-md rounded-md bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">修改{isInventory ? "库存" : "价格"}</h2><p className="mt-1 text-sm text-slate-500">{active.product.title}</p></div><button aria-label="关闭" className="text-2xl leading-none text-slate-400 hover:text-slate-700" disabled={saving} onClick={closeQuickEdit} type="button">×</button></div>
      {isInventory && <div className="mt-5 grid grid-cols-3 gap-3 rounded-sm bg-slate-50 p-4 text-center"><div><p className="text-xs text-slate-500">当前在库</p><p className="mt-1 text-xl font-bold">{active.product.onHandQuantity}</p></div><div><p className="text-xs text-slate-500">已预约</p><p className="mt-1 text-xl font-bold">{active.product.reservedQuantity}</p></div><div><p className="text-xs text-slate-500">可预约</p><p className="mt-1 text-xl font-bold">{active.product.onHandQuantity - active.product.reservedQuantity}</p></div></div>}
      <label className="mt-5 block text-sm font-semibold text-slate-700">{isInventory ? "调整后的在库数量" : "商品价格（USD）"}<input autoFocus className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600" min={isInventory ? active.product.reservedQuantity : 0} onChange={(event) => setValue(event.target.value)} step={isInventory ? 1 : 0.01} type="number" value={value} /></label>
      {isInventory && <label className="mt-4 block text-sm font-semibold text-slate-700">调整原因（可选）<textarea className="mt-2 min-h-24 w-full rounded-sm border border-slate-300 px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600" maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="例如：盘点后修正库存" value={reason} /></label>}
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button className="rounded-sm border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" disabled={saving} onClick={closeQuickEdit} type="button">取消</button><button className="rounded-sm bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60" disabled={saving} onClick={saveQuickEdit} type="button">{saving ? "保存中…" : "保存"}</button></div>
    </section></div>}
  </>;
}
