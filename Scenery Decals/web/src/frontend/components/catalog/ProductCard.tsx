"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useStore } from "@/frontend/context/StoreContext";
import { Product } from "@/shared/types/store";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const {
    openQuickView,
  } = useStore();

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-[#F3E3E8] bg-white p-3 shadow-[0_6px_20px_-10px_rgba(166,118,132,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(166,118,132,0.3)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[#FDF7F9]">
        <Link
          href={`/products/${product.slug}`}
          className="block h-full w-full focus:outline-none"
          aria-label={`View ${product.title}`}
        >
          <img
            src={product.image}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => openQuickView(product)}
            aria-label={`Quick view ${product.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#8B6D6D] opacity-0 shadow-sm transition-all hover:bg-white hover:text-[#5B3E3E] group-hover:opacity-100"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <Link
          href={`/products/${product.slug}`}
          className="block focus:outline-none"
        >
          <h3 className="truncate font-display text-[15px] font-semibold text-[#5B3E3E] transition-colors group-hover:text-[#E67B99]">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto pt-3">
          <span className="font-display text-base font-bold text-[#5B3E3E] tabular-nums">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </article>
  );
}
