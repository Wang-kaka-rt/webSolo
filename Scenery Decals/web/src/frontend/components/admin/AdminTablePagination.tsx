"use client";

import Link from "next/link";

type AdminTablePaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  hrefForPage: (page: number) => string;
};

export function AdminTablePagination({ currentPage, totalItems, pageSize = 10, hrefForPage }: AdminTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;

  const safePage = Math.min(currentPage, totalPages);
  const firstItem = (safePage - 1) * pageSize + 1;
  const lastItem = Math.min(safePage * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return <nav aria-label="表格分页" className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm text-slate-500">显示第 {firstItem}–{lastItem} 条，共 {totalItems} 条</p>
    <div className="flex items-center gap-1.5">
      {safePage === 1 ? <span aria-disabled="true" className="cursor-not-allowed rounded-sm border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-400 opacity-40">上一页</span> : <Link aria-label="上一页" className="rounded-sm border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-violet-400 hover:text-violet-700" href={hrefForPage(safePage - 1)}>上一页</Link>}
      <div className="flex items-center gap-1" aria-label="页码">
        {pages.map((page) => page === safePage ? <span aria-current="page" className="min-w-8 rounded-sm bg-violet-600 px-2 py-1.5 text-center text-sm font-medium text-white" key={page}>{page}</span> : <Link className="min-w-8 rounded-sm border border-slate-300 px-2 py-1.5 text-center text-sm font-medium text-slate-700 hover:border-violet-400 hover:text-violet-700" href={hrefForPage(page)} key={page}>{page}</Link>)}
      </div>
      {safePage === totalPages ? <span aria-disabled="true" className="cursor-not-allowed rounded-sm border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-400 opacity-40">下一页</span> : <Link aria-label="下一页" className="rounded-sm border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-violet-400 hover:text-violet-700" href={hrefForPage(safePage + 1)}>下一页</Link>}
    </div>
  </nav>;
}
