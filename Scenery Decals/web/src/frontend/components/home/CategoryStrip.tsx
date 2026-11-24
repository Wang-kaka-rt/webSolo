"use client";

import Link from "next/link";
import { useStore } from "@/frontend/context/StoreContext";
import { useLocale } from "@/frontend/context/LocaleContext";
import { message } from "@/frontend/i18n/messages";

export function CategoryStrip() {
  const { categories } = useStore();
  const { locale } = useLocale();
  const copy = message(locale);
  return (
    <section
      aria-label="Sticker categories"
      className="mx-auto max-w-[1280px] px-4 pt-7 sm:px-8"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        {categories.map((category) => {
          return (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            style={{ backgroundColor: category.bgColor }}
            className="group flex flex-col overflow-hidden rounded-lg border border-[#F3E5EA] p-2 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E67B99] hover:shadow-md"
          >
            <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-white/80">
              <img
                src={category.image}
                alt={category.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-1 pb-1 pt-2.5">
              <span className="font-display text-sm font-semibold text-[#5B3E3E] whitespace-nowrap">
                {category.name}
              </span>
              <span className="mt-0.5 text-[11px] font-medium text-[#8B6D6D] tabular-nums">
                {category.itemCount} {category.itemCount === 1 ? copy.pack : copy.packs}
              </span>
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
