"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChevronDown, ChevronRight, LayoutDashboard, LogOut, Megaphone, Settings, Tag, Users } from "lucide-react";
import { logoutAdmin } from "@/app/admin/login/actions";

const navigation = [
  { href: "/admin", label: "数据概览", icon: LayoutDashboard, exact: true },
  { href: "/admin/reservations", label: "预约订单", icon: CalendarDays },
  { href: "/admin/advertisements", label: "广告管理", icon: Megaphone },
];

const upcomingNavigation = [
  { label: "客户管理", icon: Users },
  { label: "系统设置", icon: Settings },
];

type Breadcrumb = { label: string; href?: string };

function breadcrumbsForPath(pathname: string): Breadcrumb[] {
  const dashboard = { label: "数据概览", href: "/admin" };
  if (pathname === "/admin") return [{ label: "数据概览" }];
  if (pathname.startsWith("/admin/reservations")) return [dashboard, { label: "预约订单" }];
  if (pathname.startsWith("/admin/advertisements")) return [dashboard, { label: "广告管理" }];
  if (pathname.startsWith("/admin/categories")) return [dashboard, { label: "商品管理", href: "/admin/products" }, { label: "分类编辑" }];
  if (pathname.startsWith("/admin/products/new")) return [{ label: "商品管理", href: "/admin/products" }, { label: "新增商品" }];
  if (/^\/admin\/products\/[^/]+\/edit$/.test(pathname)) return [{ label: "商品管理", href: "/admin/products" }, { label: "编辑商品" }];
  if (pathname.startsWith("/admin/products")) return [dashboard, { label: "商品管理" }];
  return [dashboard];
}

export function AdminShell({ children, showBreadcrumbs = false }: { children: React.ReactNode; showBreadcrumbs?: boolean }) {
  const pathname = usePathname();
  const breadcrumbs = breadcrumbsForPath(pathname);
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 lg:flex">
      <aside className="border-b border-slate-200 bg-white px-5 py-6 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-7 lg:py-8">
        <img
          alt="Pangpangshop"
          className="h-14 w-full object-contain object-left"
          src="/assets/aistudio/Pangpangshop________32585569.png"
        />
        <nav className="mt-10 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="后台导航">
          {navigation.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link className={`flex shrink-0 items-center gap-3 rounded-sm px-3 py-3 text-[15px] font-semibold transition ${active ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`} href={href} key={href}>
                <Icon size={21} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
          <div>
            <Link className={`flex shrink-0 items-center gap-3 rounded-sm px-3 py-3 text-[15px] font-semibold transition ${pathname.startsWith("/admin/products") || pathname.startsWith("/admin/categories") ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`} href="/admin/products">
              <Tag size={21} strokeWidth={2} />商品管理<ChevronDown className="ml-auto" size={17} />
            </Link>
            <div className="ml-5 border-l border-slate-200 py-1">
              <Link className={`block px-4 py-2 text-sm font-medium ${pathname.startsWith("/admin/categories") ? "text-blue-600" : "text-slate-500 hover:text-slate-800"}`} href="/admin/categories">分类编辑</Link>
              <Link className={`block px-4 py-2 text-sm font-medium ${pathname.startsWith("/admin/products") ? "text-blue-600" : "text-slate-500 hover:text-slate-800"}`} href="/admin/products">商品编辑</Link>
            </div>
          </div>
          <div className="hidden border-t border-slate-100 pt-4 lg:block">
            {upcomingNavigation.map(({ label, icon: Icon }) => (
              <div className="flex items-center gap-3 px-3 py-3 text-[15px] font-semibold text-slate-300" key={label}>
                <Icon size={21} strokeWidth={2} />
                {label}
              </div>
            ))}
          </div>
        </nav>
        <form action={logoutAdmin} className="mt-8 hidden lg:block">
          <button className="flex w-full items-center gap-3 rounded-sm px-3 py-3 text-[15px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700" type="submit">
            <LogOut size={21} strokeWidth={2} />退出登录
          </button>
        </form>
      </aside>
      <section className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        {showBreadcrumbs && <nav aria-label="面包屑导航" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm">
          {breadcrumbs.map((breadcrumb, index) => <span className="flex items-center gap-1.5" key={`${breadcrumb.label}-${index}`}>
            {index > 0 && <ChevronRight aria-hidden="true" className="h-4 w-4 text-slate-400" />}
            {breadcrumb.href ? <Link className="font-medium text-slate-500 hover:text-violet-700" href={breadcrumb.href}>{breadcrumb.label}</Link> : <span className="font-semibold text-slate-800" aria-current="page">{breadcrumb.label}</span>}
          </span>)}
        </nav>}
        {children}
      </section>
    </main>
  );
}
