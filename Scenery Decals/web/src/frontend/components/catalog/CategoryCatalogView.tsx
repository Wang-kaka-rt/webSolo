"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { useLocale } from "@/frontend/context/LocaleContext";
import { message } from "@/frontend/i18n/messages";
import { useStore } from "@/frontend/context/StoreContext";
import { ProductCard } from "@/frontend/components/catalog/ProductCard";
import { CategorySlug, Product, StickerFinish } from "@/shared/types/store";

interface CategoryCatalogViewProps {
  initialSlug: CategorySlug;
  initialProducts: Product[];
}

export function CategoryCatalogView({
  initialSlug,
  initialProducts,
}: CategoryCatalogViewProps) {
  const { locale } = useLocale();
  const copy = message(locale);
  const { categories } = useStore();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sort, setSort] = useState<"popular" | "rating" | "price-asc">("popular");
  const [finish, setFinish] = useState<"all" | StickerFinish>("all");
  const [finishOptions, setFinishOptions] = useState<("all" | StickerFinish)[]>(["all"]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const activeCategory = categories.find((c) => c.slug === initialSlug);

  useEffect(() => {
    fetch("/api/finishes")
      .then((response) => response.ok ? response.json() : null)
      .then((data: { finishes?: string[] } | null) => setFinishOptions(["all", ...(data?.finishes ?? [])]))
      .catch(() => setFinishOptions(["all"]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (initialSlug !== "all") params.set("category", initialSlug);
        if (finish !== "all") params.set("finish", finish);
        params.set("sort", sort);
        params.set("locale", locale);

        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as { products: Product[] };
          setProducts(data.products);
        }
      } catch {
        // Ignore aborted fetch
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [finish, initialProducts, initialSlug, locale, sort]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs font-medium text-[#8B6D6D]"
      >
        <Link href="/" className="transition-colors hover:text-[#5B3E3E]">
          {copy.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href="/categories"
          className="transition-colors hover:text-[#5B3E3E]"
        >
          {copy.collections}
        </Link>
        {activeCategory && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#5B3E3E]">{activeCategory?.name}</span>
          </>
        )}
      </nav>

      {/* Main 2-Column Boutique Layout */}
      <div className="mt-5 grid grid-cols-1 items-start gap-7 lg:grid-cols-[240px_1fr]">
        {/* Left Category & Finish Sidebar */}
        <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block">
          <div className="rounded-lg border border-[#F3E3E8] bg-white p-3.5">
            <h2 className="px-2 font-display text-sm font-bold text-[#5B3E3E]">
              {copy.collections}
            </h2>
            <nav
              aria-label="Collection categories"
              className="mt-2 flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
            >
              <Link
                href="/categories"
                className={`flex shrink-0 items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                  initialSlug === "all"
                    ? "bg-[#FFE5EE] font-semibold text-[#5B3E3E]"
                    : "font-medium text-[#6B4C4C] hover:bg-[#FFF5F8]"
                }`}
              >
                <span className="whitespace-nowrap">{copy.allStickerPacks}</span>
                <span className="ml-2 text-[11px] text-[#9C7D7D] tabular-nums">
                  {products.length}
                </span>
              </Link>

              {categories.map((cat) => {
                const isActive = initialSlug === cat.slug;
                return (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className={`flex shrink-0 items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                      isActive
                        ? "bg-[#FFE5EE] font-semibold text-[#5B3E3E]"
                        : "font-medium text-[#6B4C4C] hover:bg-[#FFF5F8]"
                    }`}
                  >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: cat.accentColor }}
                      />
                      <span>{cat.name}</span>
                    </span>
                    <span className="ml-2 text-[11px] text-[#9C7D7D] tabular-nums">
                      {cat.itemCount}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-lg border border-[#F3E3E8] bg-white p-3.5">
            <h2 className="px-2 font-display text-sm font-bold text-[#5B3E3E]">
              {copy.paperFinish}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5 lg:flex-col lg:gap-1">
              {finishOptions.map((opt) => {
                const isSelected = finish === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFinish(opt)}
                    className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-[#FFF0F5] font-semibold text-[#5B3E3E]"
                        : "font-medium text-[#6B4C4C] hover:bg-[#FFF8FA]"
                    }`}
                  >
                    <span className="whitespace-nowrap">
                      {opt === "all" ? copy.allFinishes : opt}
                    </span>
                    {isSelected && (
                      <Check className="ml-2 h-3.5 w-3.5 shrink-0 text-[#E67B99]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Product Grid Area */}
        <div>
          <div className="hidden flex-wrap items-center justify-between gap-3 border-b border-[#F3E3E8] pb-3.5 lg:flex">
            <div className="flex items-baseline gap-2.5">
              <h1 className="font-display text-2xl font-bold text-[#5B3E3E]">
                {activeCategory ? activeCategory.name : copy.allStickerPacks}
              </h1>
              <span className="text-xs font-medium text-[#8B6D6D] tabular-nums">
                {isLoading
                  ? "Updating..."
                  : `${products.length} ${products.length === 1 ? copy.pack : copy.packs}`}
              </span>
            </div>

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as "popular" | "rating" | "price-asc")
              }
              aria-label="Sort collection"
              className="rounded-lg border border-[#EED6DF] bg-white px-3 py-1.5 text-xs font-medium text-[#5B3E3E] focus:border-[#F291AC] focus:outline-none"
            >
              <option value="popular">{copy.sortPopular}</option>
              <option value="rating">{copy.sortTopRated}</option>
              <option value="price-asc">{copy.sortPriceLow}</option>
            </select>
          </div>

          {isLoading ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse rounded-lg border border-[#F3E3E8] bg-white p-3"
                >
                  <div className="aspect-[4/3] w-full rounded-md bg-[#FCEEF2]" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-[#FCEEF2]" />
                  <div className="mt-2 h-3 w-1/3 rounded bg-[#FCEEF2]" />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-5 w-14 rounded bg-[#FCEEF2]" />
                    <div className="h-8 w-12 rounded-full bg-[#FCEEF2]" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="mt-5 rounded-lg border border-[#F3E3E8] bg-white p-10 text-center">
              <p className="font-display text-lg font-semibold text-[#5B3E3E]">
                No matching sticker packs found
              </p>
              <p className="mt-1 text-xs text-[#8B6D6D]">
                Try switching back to All Finishes to view every item in this
                collection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFinish("all");
                  setSort("popular");
                }}
                className="mt-4 rounded-full bg-[#F291AC] px-5 py-2 text-xs font-semibold text-white hover:bg-[#E67B99]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      <button aria-label={copy.filterProducts} className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#F291AC] text-white shadow-lg shadow-[#D98AA5]/40 transition hover:bg-[#E67B99] lg:hidden" onClick={() => setIsMobileFiltersOpen(true)} type="button"><SlidersHorizontal className="h-5 w-5" /></button>
      {isMobileFiltersOpen && <div aria-modal="true" className="fixed inset-0 z-50 bg-[#3C262B]/35 lg:hidden" onClick={() => setIsMobileFiltersOpen(false)} role="dialog" aria-label={copy.filterProducts}>
        <section className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-y-auto rounded-t-2xl bg-[#FFFDFB] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold text-[#5B3E3E]">{copy.filterProducts}</h2><button aria-label={copy.closeDialog} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF0F5] text-[#6B4C4C]" onClick={() => setIsMobileFiltersOpen(false)} type="button"><X className="h-4 w-4" /></button></div>
          <section className="mt-5"><h3 className="font-display text-sm font-bold text-[#5B3E3E]">{copy.collections}</h3><div className="mt-3 flex flex-wrap gap-2"><Link className={`rounded-full px-3 py-2 text-sm ${initialSlug === "all" ? "bg-[#F291AC] font-semibold text-white" : "bg-[#FFF0F5] text-[#6B4C4C]"}`} href="/categories" onClick={() => setIsMobileFiltersOpen(false)}>{copy.allStickerPacks}</Link>{categories.map((category) => <Link className={`rounded-full px-3 py-2 text-sm ${initialSlug === category.slug ? "bg-[#F291AC] font-semibold text-white" : "bg-[#FFF0F5] text-[#6B4C4C]"}`} href={`/categories/${category.slug}`} key={category.slug} onClick={() => setIsMobileFiltersOpen(false)}>{category.name}</Link>)}</div></section>
          <section className="mt-6 border-t border-[#F3E3E8] pt-5"><h3 className="font-display text-sm font-bold text-[#5B3E3E]">{copy.paperFinish}</h3><div className="mt-3 flex flex-wrap gap-2">{finishOptions.map((option) => { const selected = finish === option; return <button className={`rounded-full px-3 py-2 text-sm ${selected ? "bg-[#F291AC] font-semibold text-white" : "bg-[#FFF0F5] text-[#6B4C4C]"}`} key={option} onClick={() => { setFinish(option); setIsMobileFiltersOpen(false); }} type="button">{option === "all" ? copy.allFinishes : option}</button>; })}</div></section>
        </section>
      </div>}
    </div>
  );
}
