"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

export function ProductImageUpload({ productId, imageUrls, category, productSlug, onChange }: { productId?: string; imageUrls: string[]; category: string; productSlug: string; onChange: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function upload(files: FileList | File[]) {
    if (!productId && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(productSlug)) { setError("请先填写有效的商品链接，再上传图片。"); return; }
    const selected = Array.from(files).slice(0, Math.max(0, 12 - imageUrls.length));
    if (!selected.length) return;
    setUploading(true); setError(null);
    try {
      const urls: string[] = [];
      for (const file of selected) {
        const formData = new FormData(); formData.set("image", file);
        if (!productId) { formData.set("category", category); formData.set("slug", productSlug); }
        const endpoint = productId ? `/api/admin/products/${productId}/images` : "/api/admin/products/upload-image";
        const response = await fetch(endpoint, { method: "POST", body: formData });
        const result = await response.json() as { error?: string; imageUrl?: string };
        if (!response.ok || !result.imageUrl) throw new Error(result.error ?? "上传失败。");
        urls.push(result.imageUrl);
      }
      onChange([...imageUrls, ...urls]);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "图片上传失败。"); }
    finally { setUploading(false); }
  }
  return <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6"><h2 className="text-lg font-bold text-slate-900">商品图片</h2><p className="mt-1 text-sm text-slate-500">可多选或拖拽上传；第一张为主图，最多 12 张。</p>
    <div className="mt-5 grid grid-cols-3 gap-2">{imageUrls.map((url, index) => <div className="relative aspect-square overflow-hidden rounded-sm border border-slate-200 bg-slate-100" key={url}><img alt={`商品图片 ${index + 1}`} className="h-full w-full object-cover" src={url}/>{index === 0 && <span className="absolute left-1 top-1 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">主图</span>}<button aria-label="删除图片" className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-600" onClick={() => onChange(imageUrls.filter((item) => item !== url))} type="button"><X size={13}/></button></div>)}</div>
    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-violet-300 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-60" disabled={uploading || imageUrls.length >= 12} onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void upload(event.dataTransfer.files); }} type="button"><Upload size={18}/>{uploading ? "上传中…" : "点击或拖拽上传图片"}</button>
    <input accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading} multiple onChange={(event) => { if (event.target.files) void upload(event.target.files); event.currentTarget.value = ""; }} ref={inputRef} type="file"/><p className="mt-2 text-xs text-slate-400">支持 JPG、PNG、WebP、GIF，单张最大 8MB。</p>{error && <p className="mt-3 text-sm text-rose-600">{error}</p>}</aside>;
}
