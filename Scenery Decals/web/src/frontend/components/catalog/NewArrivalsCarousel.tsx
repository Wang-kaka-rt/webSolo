"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
} from "lucide-react";
import { useStore } from "@/frontend/context/StoreContext";

export function NewArrivalsCarousel() {
  const { newArrivals, addToCartAsync } = useStore();
  const [startIndex, setStartIndex] = useState(0);

  const visibleCount = 5;
  const maxStart = Math.max(0, newArrivals.length - visibleCount);

  const handlePrev = () => {
    setStartIndex((prev) => (prev <= 0 ? maxStart : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev >= maxStart ? 0 : prev + 1));
  };

  const visibleItems =
    newArrivals.length <= visibleCount
      ? newArrivals
      : newArrivals.slice(startIndex, startIndex + visibleCount);

  return (
    <section
      id="new-arrivals"
      className="mx-auto max-w-[1280px] px-4 pb-14 pt-10 sm:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF2CC] text-[#E6A23C]">
            <Star className="h-5 w-5 fill-[#F8CF5C]" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#5B3E3E] sm:text-[26px]">
              New Arrivals
            </h2>
            <p className="text-xs font-medium text-[#8B6D6D]">
              Discover what&apos;s new!
            </p>
          </div>
        </div>

        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full border border-[#EED6DF] bg-white px-4 py-1.5 text-xs font-semibold text-[#6B4C4C] transition-colors hover:border-[#F291AC] hover:bg-[#FFF5F8]"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="relative mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous new arrivals"
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EED6DF] bg-white text-[#8B6D6D] shadow-sm transition-colors hover:border-[#F291AC] hover:text-[#5B3E3E] md:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-[#F3E3E8] bg-white p-2.5 shadow-[0_6px_18px_-10px_rgba(166,118,132,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[4/4] w-full overflow-hidden rounded-md bg-[#FDF7F9]">
                <Link
                  href={`/products/${item.slug}`}
                  className="block h-full w-full focus:outline-none"
                  aria-label={`View ${item.title}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-[#88BC6E] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                  New
                </span>

                <button
                  type="button"
                  onClick={() => addToCartAsync(item.id)}
                  aria-label={`Quick add ${item.title}`}
                  className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#E67B99] opacity-95 shadow-sm transition-all duration-150 hover:scale-105 hover:bg-[#F291AC] hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Link
                href={`/products/${item.slug}`}
                className="mt-2.5 block text-left"
              >
                <p className="truncate font-display text-xs font-semibold text-[#5B3E3E] group-hover:text-[#E67B99]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs font-bold text-[#8B6D6D] tabular-nums">
                  ${item.price.toFixed(2)}
                </p>
              </Link>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next new arrivals"
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EED6DF] bg-white text-[#8B6D6D] shadow-sm transition-colors hover:border-[#F291AC] hover:text-[#5B3E3E] md:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
