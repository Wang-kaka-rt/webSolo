"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { AdminTablePagination } from "@/frontend/components/admin/AdminTablePagination";
import type { AdminProductCategory } from "@/shared/types/productCategory";

const languages = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
  { key: "ko", label: "한국어" },
] as const;
type Language = (typeof languages)[number]["key"];

const blankCategory: AdminProductCategory = {
  slug: "", name: "", nameZh: "", nameKo: "", imageUrl: "", productCount: 0,
};

export function AdminCategoryPanel({ initialCategories, page, search, totalItems }: { initialCategories: AdminProductCategory[]; page: number; search?: string; totalItems: number }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState(initialCategories);
  const [active, setActive] = useState<AdminProductCategory | null>(null);
  const [language, setLanguage] = useState<Language>("zh");
  const [values, setValues] = useState({ zh: "", en: "", ko: "" });
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => { setCategories(initialCategories); }, [initialCategories]);

  const open = (category?: AdminProductCategory) => {
    const selected = category ?? blankCategory;
    setActive(selected);
    setSlug(selected.slug);
    setImageUrl(selected.imageUrl);
    setValues({ zh: selected.nameZh, en: selected.name, ko: selected.nameKo });
    setLanguage("zh");
    setError(null);
  };

  const close = () => {
    setActive(null);
    setError(null);
  };

  async function uploadImage(file: File) {
    if (!slug.trim()) {
      setError("请先填写分类标识，再上传封面图片。");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("slug", slug.trim());
      formData.set("image", file);
      const response = await fetch("/api/admin/categories/upload-image", { method: "POST", body: formData });
      const result = await response.json() as { imageUrl?: string; error?: string };
      if (!response.ok || !result.imageUrl) throw new Error(result.error ?? "图片上传失败。");
      setImageUrl(result.imageUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "图片上传失败。");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!active) return;
    setSaving(true);
    setError(null);
    const payload = { slug, name: values.en, nameZh: values.zh, nameKo: values.ko, imageUrl };
    try {
      const response = await fetch(
        active.slug ? `/api/admin/categories/${active.slug}` : "/api/admin/categories",
        { method: active.slug ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      const result = await response.json() as { category?: AdminProductCategory; error?: string };
      if (!response.ok || !result.category) throw new Error(result.error ?? "保存失败。");
      setCategories((current) => active.slug
        ? current.map((item) => item.slug === active.slug ? { ...result.category!, productCount: item.productCount } : item)
        : [...current, { ...result.category!, productCount: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
      close();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存失败。");
    } finally {
      setSaving(false);
    }
  }

  async function remove(category: AdminProductCategory) {
    if (!window.confirm(`确定删除分类「${category.nameZh || category.name}」吗？`)) return;
    setDeletingSlug(category.slug);
    try {
      const response = await fetch(`/api/admin/categories/${category.slug}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "删除失败。");
      setCategories((current) => current.filter((item) => item.slug !== category.slug));
      router.refresh();
    } catch (caught) {
      window.alert(caught instanceof Error ? caught.message : "删除失败。");
    } finally {
      setDeletingSlug(null);
    }
  }

  const field = "mt-1.5 w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-violet-600 focus:ring-1 focus:ring-violet-600";

  return <div>
    <header className="rounded-md border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,620px)_auto] lg:items-center">
        <div><h1 className="text-3xl font-extrabold tracking-tight">分类编辑</h1><p className="mt-2 text-base text-slate-500">可新增或修改分类；修改分类标识会同步更新该分类下的商品。</p></div>
        <form action="/admin/categories" className="flex w-full items-center gap-2"><label className="sr-only" htmlFor="category-search">搜索分类</label><div className="relative min-w-0 flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="w-full rounded-sm border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:bg-white focus:ring-2 focus:ring-violet-100" defaultValue={search} id="category-search" name="search" placeholder="搜索中文、韩语或英文分类名称" type="search" /></div><button className="shrink-0 rounded-sm border border-violet-600 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50" type="submit">搜索</button>{search && <Link className="shrink-0 rounded-sm px-2 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-violet-700" href="/admin/categories">清除</Link>}</form>
        <button className="inline-flex shrink-0 items-center justify-center rounded-sm bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700" onClick={() => open()}>新增分类</button>
      </div>
    </header>
    <section className="mt-7 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">封面图片</th><th className="px-5 py-3">分类名称</th><th className="px-5 py-3">分类标识</th><th className="px-5 py-3">商品数量</th><th className="px-5 py-3 text-right">操作</th></tr></thead>
        <tbody className="divide-y divide-slate-200">{categories.map((category) => <tr key={category.slug}>
          <td className="px-5 py-3">{category.imageUrl ? <img alt={`${category.name} 分类封面`} className="h-12 w-16 rounded-sm border border-slate-200 object-cover" src={category.imageUrl} /> : <div className="flex h-12 w-16 items-center justify-center rounded-sm border border-dashed border-slate-300 text-[11px] text-slate-400">未上传</div>}</td>
          <td className="px-5 py-4 font-semibold">{category.name}</td><td className="px-5 py-4 text-slate-500">{category.slug}</td><td className="px-5 py-4">{category.productCount}</td>
          <td className="px-5 py-4 text-right"><button className="mr-2 rounded-sm border border-slate-300 px-3 py-1.5 text-xs hover:border-violet-500" onClick={() => open(category)}>修改</button><Link className="mr-2 rounded-sm border border-slate-300 px-3 py-1.5 text-xs hover:border-violet-500" href={`/admin/products?category=${category.slug}`}>查看商品</Link><button className="rounded-sm border border-rose-200 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50" disabled={deletingSlug === category.slug} onClick={() => void remove(category)}>{deletingSlug === category.slug ? "删除中…" : "删除"}</button></td>
        </tr>)}</tbody>
      </table>
      <AdminTablePagination currentPage={page} hrefForPage={(nextPage) => `/admin/categories?${search ? `search=${encodeURIComponent(search)}&` : ""}page=${nextPage}`} totalItems={totalItems} />
    </section>
    {active && <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }} role="dialog">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold">{active.slug ? "修改分类" : "新增分类"}</h2>
        <div className="mt-4 inline-flex rounded-sm border border-slate-200 bg-slate-50 p-1">{languages.map((item) => <button className={`rounded-sm px-4 py-2 text-sm ${language === item.key ? "bg-violet-600 font-semibold text-white" : "text-slate-600"}`} key={item.key} onClick={() => setLanguage(item.key)} type="button">{item.label}</button>)}</div>
        <p className="mt-3 text-sm text-slate-500">正在编辑：{languages.find((item) => item.key === language)?.label} 分类名称</p>
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_220px]">
          <div><label className="block text-sm font-semibold">分类名称<input autoFocus className={field} onChange={(event) => setValues((old) => ({ ...old, [language]: event.target.value }))} value={values[language]} /></label><label className="mt-4 block text-sm font-semibold">分类标识<input className={field} onChange={(event) => setSlug(event.target.value)} value={slug} /><span className="mt-1 block text-xs font-normal text-slate-500">此字段三种语言共用；修改后会同步迁移分类下的商品。</span></label></div>
          <div><span className="block text-sm font-semibold">分类封面图片</span><button className="mt-1.5 flex h-44 w-full items-center justify-center overflow-hidden rounded-sm border border-dashed border-violet-300 bg-violet-50/40 text-sm text-violet-700 hover:bg-violet-50" disabled={uploading} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) void uploadImage(file); }} type="button">{imageUrl ? <img alt="分类封面预览" className="h-full w-full object-cover" src={imageUrl} /> : uploading ? "上传中…" : "点击或拖拽上传"}</button><input accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.currentTarget.value = ""; }} ref={fileInputRef} type="file" /><p className="mt-1.5 text-xs text-slate-500">JPG、PNG、WebP、GIF，最大 8MB。</p></div>
        </div>
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-3"><button className="rounded-sm border border-slate-300 px-4 py-2 text-sm" onClick={close}>取消</button><button className="rounded-sm bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={saving || uploading} onClick={() => void submit()}>{saving ? "保存中…" : "保存分类"}</button></div>
      </div>
    </div>}
  </div>;
}
