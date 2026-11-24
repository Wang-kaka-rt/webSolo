"use client";

import Link from "next/link";
import { ArrowRight, Crown, Heart, RotateCcw } from "lucide-react";
import { useStore } from "@/frontend/context/StoreContext";
import { useLocale } from "@/frontend/context/LocaleContext";
import { message } from "@/frontend/i18n/messages";
import { ProductCard } from "./ProductCard";

export function BestSellersSection() {
  const { locale } = useLocale(); const copy = message(locale);
  const {
    products, categories,
    activeCategory,
    sortMode,
    showAllCatalog,
    isLoadingCatalog,
    catalogError,
    selectCategory,
    setSortAndFetch,
  } = useStore();

  const activeCategoryLabel =
    activeCategory === "all"
      ? showAllCatalog
        ? copy.allProducts
        : copy.bestSellers
      : categories.find((c) => c.slug === activeCategory)?.name ??
        copy.bestSellers;

  return (
    <section
      id="best-sellers"
      className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF2CC] text-[#E6A23C]">
            <Crown className="h-5 w-5 fill-[#F8CF5C]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-2xl font-bold text-[#5B3E3E] sm:text-[26px]">
                {activeCategoryLabel}
              </h2>
              {activeCategory !== "all" && (
                <button
                  type="button"
                  onClick={() => selectCategory("all")}
                  className="inline-flex items-center gap-1 rounded-full bg-[#FFEAF1] px-2.5 py-0.5 text-xs font-medium text-[#8B4D60] transition-colors hover:bg-[#FAD6E3]"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{copy.reset}</span>
                </button>
              )}
            </div>
            <p className="flex items-center gap-1 text-xs font-medium text-[#8B6D6D]">
              <span>{copy.loved}</span>
              <Heart className="h-3 w-3 fill-[#F291AC] text-[#F291AC]" />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="catalog-sort">
            {copy.sort}
          </label>
          <select
            id="catalog-sort"
            value={sortMode}
            onChange={(e) =>
              setSortAndFetch(
                e.target.value as "popular" | "price-asc" | "rating"
              )
            }
            className="rounded-full border border-[#EED6DF] bg-white px-3.5 py-1.5 text-xs font-medium text-[#6B4C4C] focus:border-[#F291AC] focus:outline-none"
          >
            <option value="popular">{copy.popular}</option>
            <option value="rating">{copy.topRated}</option>
            <option value="price-asc">{copy.priceLow}</option>
          </select>

          <Link
            href={
              activeCategory === "all"
                ? "/categories"
                : `/categories/${activeCategory}`
            }
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full border border-[#EED6DF] bg-white px-4 py-1.5 text-xs font-semibold text-[#6B4C4C] transition-colors hover:border-[#F291AC] hover:bg-[#FFF5F8]"
          >
            <span>{copy.viewAll}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {catalogError ? (
        <div className="mt-6 rounded-lg border border-[#F5D6E0] bg-white p-8 text-center">
          <p className="text-sm text-[#6B4C4C]">{catalogError}</p>
          <button
            type="button"
            onClick={() => selectCategory("all")}
            className="mt-3 rounded-full bg-[#F291AC] px-5 py-2 text-xs font-semibold text-white hover:bg-[#E67B99]"
          >
            {copy.reload}
          </button>
        </div>
      ) : isLoadingCatalog ? (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
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
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
