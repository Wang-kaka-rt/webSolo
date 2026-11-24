"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminProductItem } from "@/shared/types/productAdmin";
import type { AdminProductCategory } from "@/shared/types/productCategory";
import { ProductImageUpload } from "@/frontend/components/admin/ProductImageUpload";

const languages = [{ key: "zh", label: "中文" }, { key: "en", label: "English" }, { key: "ko", label: "한국어" }] as const;
const fallbackCategories = [{ slug: "flower-garden", name: "Flower Garden" }];
type Language = (typeof languages)[number]["key"];

export function AdminProductForm({ product, categories = fallbackCategories }: { product?: AdminProductItem; categories?: Array<Pick<AdminProductCategory, "slug" | "name">> }) {
  const router = useRouter();
  const editing = Boolean(product);
  const [language, setLanguage] = useState<Language>("zh");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [imageUrls, setImageUrls] = useState(product?.imageUrls?.length ? product.imageUrls : product?.imageUrl ? [product.imageUrl] : []);
  const [category, setCategory] = useState(product?.category ?? categories[0].slug);
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [text, setText] = useState({
    zh: { title: product?.titleZh || product?.title || "", description: product?.descriptionZh || product?.description || "" },
    en: { title: product?.title ?? "", description: product?.description ?? "" },
    ko: { title: product?.titleKo || product?.title || "", description: product?.descriptionKo || product?.description || "" },
  });
  const field = "mt-1.5 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600";
  const changeText = (fieldName: "title" | "description", value: string) => setText((old) => ({ ...old, [language]: { ...old[language], [fieldName]: value } }));

  function downloadAiPrompt() {
    const prompt = `你是一位专业的电商商品文案翻译与本地化编辑。请根据我随后提供的产品介绍，生成 Pangpangshop 商品后台可直接导入的三语 JSON。\n\n要求：\n1. 必须输出严格合法的 JSON，不要 Markdown 代码块、说明文字或额外字段。\n2. 必须包含 zh、en、ko 三个对象；每个对象必须包含 title 和 description。\n3. zh 使用简体中文；en 使用自然的英文电商文案；ko 使用自然的韩语电商文案。\n4. title 简洁明确，description 保留产品的实际卖点，不虚构材质、规格、价格或功能。\n5. 三种语言表达的商品含义必须一致。\n\n输出格式（请严格遵守）：\n{\n  "zh": {\n    "title": "中文商品名称",\n    "description": "中文商品描述"\n  },\n  "en": {\n    "title": "English product title",\n    "description": "English product description"\n  },\n  "ko": {\n    "title": "한국어 상품명",\n    "description": "한국어 상품 설명"\n  }\n}\n\n产品介绍：\n请在这里粘贴产品名称、卖点、设计主题、适用场景和已确认的材质/规格。`;
    const url = URL.createObjectURL(new Blob([prompt], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pangpangshop-product-i18n-prompt.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importAiJson() {
    setError(null);
    try {
      const raw = JSON.parse(importJson) as Record<string, unknown>;
      const source = (raw.translations && typeof raw.translations === "object" ? raw.translations : raw) as Record<string, unknown>;
      const nextText = {} as typeof text;
      for (const locale of ["zh", "en", "ko"] as const) {
        const value = source[locale];
        if (!value || typeof value !== "object") throw new Error("JSON 必须包含 zh、en、ko 三种语言内容。");
        const translation = value as Record<string, unknown>;
        if (typeof translation.title !== "string" || !translation.title.trim() || typeof translation.description !== "string" || !translation.description.trim()) {
          throw new Error(`${locale} 内容必须包含非空的 title 和 description。`);
        }
        nextText[locale] = { title: translation.title.trim(), description: translation.description.trim() };
      }
      setText(nextText);
      setLanguage("zh");
      setImportJson("");
      setIsImportModalOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? `导入失败：${caught.message}` : "导入失败，请粘贴有效的 AI JSON 内容。");
    }
  }

  async function submit(data: FormData) {
    setError(null);
    const missingLanguage = languages.find((item) => !text[item.key].title.trim() || !text[item.key].description.trim());
    if (missingLanguage) {
      setLanguage(missingLanguage.key);
      setError(`请完成 ${missingLanguage.label} 的商品名称和商品描述。`);
      return;
    }
    if (!imageUrls.length || imageUrls.some((url) => url.startsWith("blob:"))) {
      setError("请至少上传一张商品图片，不能使用仅本地预览的图片。");
      return;
    }
    setSaving(true);
    const selected = categories.find((item) => item.slug === category) ?? categories[0];
    const payload = {
      title: text.en.title, titleZh: text.zh.title, titleKo: text.ko.title,
      description: text.en.description, descriptionZh: text.zh.description, descriptionKo: text.ko.description,
      slug, category: selected.slug, categoryLabel: selected.name, price: Number(data.get("price")),
      tag: String(data.get("tag") ?? "") || null, imageUrl: imageUrls[0], imageUrls,
      sheetCount: String(data.get("sheetCount") ?? ""), dimensions: String(data.get("dimensions") ?? ""),
      finishes: String(data.get("finishes") ?? "").split("/").map((item) => item.trim()).filter(Boolean),
      section: String(data.get("section") ?? "new-arrival"), isActive: data.get("isActive") === "on",
      ...(!editing ? { initialStock: Number(data.get("initialStock")) } : {}),
    };
    try {
      const response = await fetch(editing ? `/api/admin/products/${product!.id}` : "/api/admin/products", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "保存失败。");
      router.push("/admin/products");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存失败。");
    } finally {
      setSaving(false);
    }
  }

  return <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
    <form action={submit} className="space-y-5 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-sm border border-slate-200 bg-slate-50 p-1">{languages.map((item) => <button className={`rounded-sm px-5 py-2 text-sm font-semibold ${language === item.key ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-white"}`} key={item.key} onClick={() => setLanguage(item.key)} type="button">{item.label}</button>)}</div>
        <div className="flex items-center gap-2">
          <button className="rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-violet-400 hover:text-violet-700" onClick={downloadAiPrompt} type="button">下载 AI Prompt</button>
          <button className="rounded-sm bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700" onClick={() => setIsImportModalOpen(true)} type="button">导入 JSON</button>
        </div>
      </div>
      <p className="text-sm text-slate-500">正在编辑：{languages.find((item) => item.key === language)?.label} 内容。保存前需完成中、英、韩三种语言。</p>
      <label className="flex items-center gap-2 rounded-sm border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold"><input defaultChecked={product?.isActive ?? true} name="isActive" type="checkbox" />立即上架此商品</label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label>商品名称<input className={field} onChange={(event) => changeText("title", event.target.value)} value={text[language].title} /></label>
        <label>商品链接（slug）<input className={field} onChange={(event) => setSlug(event.target.value)} required value={slug} /></label>
        <label>所属分类<select className={field} onChange={(event) => setCategory(event.target.value)} value={category}>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <label>价格（USD）<input className={field} defaultValue={product?.price} name="price" required type="number" /></label>
      </div>
      <label>商品描述<textarea className={`${field} min-h-32`} onChange={(event) => changeText("description", event.target.value)} value={text[language].description} /></label>
      <p className="text-sm text-slate-500">商品图集请在右侧上传，第一张图片会作为前端主图。</p>
      <label>材质/工艺（使用 / 区分）<input className={field} defaultValue={product?.finishes.join(" / ")} name="finishes" placeholder="例如：Matte Vinyl / Glossy Washi" required /></label>
      {error && <p className="text-rose-600">{error}</p>}
      <button className="rounded-sm bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={saving} type="submit">{saving ? "保存中…" : "保存商品"}</button>
      {isImportModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="ai-json-import-title">
        <div className="w-full max-w-2xl rounded-md bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900" id="ai-json-import-title">粘贴 AI 三语 JSON</h2><p className="mt-1 text-sm text-slate-500">将 AI 返回的完整 JSON 直接粘贴到下方，确认后自动填充中、英、韩商品名称与描述。</p></div><button aria-label="关闭" className="text-2xl leading-none text-slate-400 hover:text-slate-700" onClick={() => setIsImportModalOpen(false)} type="button">×</button></div>
          <textarea autoFocus className="mt-5 min-h-72 w-full rounded-sm border border-slate-300 p-3 font-mono text-sm outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600" onChange={(event) => setImportJson(event.target.value)} placeholder={'{\n  "zh": { "title": "...", "description": "..." },\n  "en": { "title": "...", "description": "..." },\n  "ko": { "title": "...", "description": "..." }\n}'} value={importJson} />
          <div className="mt-5 flex justify-end gap-3"><button className="rounded-sm border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" onClick={() => setIsImportModalOpen(false)} type="button">取消</button><button className="rounded-sm bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700" onClick={importAiJson} type="button">确认导入</button></div>
        </div>
      </div>}
    </form>
    <ProductImageUpload category={category} imageUrls={imageUrls} onChange={setImageUrls} productId={editing ? product!.id : undefined} productSlug={slug} />
  </div>;
}
