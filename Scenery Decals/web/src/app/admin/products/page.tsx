import Link from "next/link";
import { Search } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { getAdminProductsPage } from "@/backend/services/productService";
import { AdminProductPanel } from "@/frontend/components/admin/AdminProductPanel";
import { AdminShell } from "@/frontend/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string; search?: string }> }) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin/login");

  const { category, page: rawPage, search: rawSearch } = await searchParams;
  const search = rawSearch?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
  const { items: products, total } = await getAdminProductsPage(page, 10, category, search);
  const categoryLabel = category ? products[0]?.categoryLabel ?? category : null;
  const paginationParams = new URLSearchParams();
  if (category) paginationParams.set("category", category);
  if (search) paginationParams.set("search", search);
  const paginationQuery = paginationParams.toString();
  const paginationPath = `/admin/products${paginationQuery ? `?${paginationQuery}` : ""}`;
  const clearSearchHref = category ? `/admin/products?category=${encodeURIComponent(category)}` : "/admin/products";

  return <AdminShell>
    <header className="rounded-md border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,620px)_auto] lg:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">商品管理</h1>
          <p className="mt-2 text-base text-slate-500">{categoryLabel ? `当前分类：${categoryLabel}。` : "创建商品时自动生成库存记录；双击价格或库存即可快速修改。"}</p>
          {category && <Link className="mt-2 inline-block text-sm font-semibold text-violet-700 hover:text-violet-800" href="/admin/products">查看全部商品</Link>}
        </div>
        <form action="/admin/products" className="flex w-full items-center gap-2">
          {category && <input name="category" type="hidden" value={category} />}
          <label className="sr-only" htmlFor="product-search">搜索商品</label>
          <div className="relative min-w-0 flex-1">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="w-full rounded-sm border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:bg-white focus:ring-2 focus:ring-violet-100" defaultValue={search} id="product-search" name="search" placeholder="搜索编号、中文、韩语或英文名称" type="search" />
          </div>
          <button className="shrink-0 rounded-sm border border-violet-600 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50" type="submit">搜索</button>
          {search && <Link className="shrink-0 rounded-sm px-2 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-violet-700" href={clearSearchHref}>清除</Link>}
        </form>
        <Link className="inline-flex shrink-0 items-center justify-center rounded-sm bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700" href="/admin/products/new">新增商品</Link>
      </div>
    </header>
    <div className="mt-7"><AdminProductPanel page={page} paginationPath={paginationPath} products={products} totalItems={total} /></div>
  </AdminShell>;
}
