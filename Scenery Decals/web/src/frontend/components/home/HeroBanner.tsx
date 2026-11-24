"use client";

import { ArrowRight, Heart } from "lucide-react";
import { useMemo } from "react";
import { useLocale } from "@/frontend/context/LocaleContext";
import { useStore } from "@/frontend/context/StoreContext";

type Block = "title" | "subtitle" | "cta" | "bubble";
type Layout = Record<Block, { x: number; y: number }>;

const fallback: Layout = { title: { x: 8, y: 35 }, subtitle: { x: 8, y: 60 }, cta: { x: 8, y: 72 }, bubble: { x: 80, y: 8 } };

function layoutOf(raw?: string): Layout {
  try { return { ...fallback, ...(raw ? JSON.parse(raw) : {}) }; } catch { return fallback; }
}

export function HeroBanner() {
  const { locale } = useLocale();
  const { heroAdvertisement: ad } = useStore();

  const layout = useMemo(() => layoutOf(ad?.layoutJson), [ad?.layoutJson]);
  if (!ad) return null;
  const text = locale === "zh" ? { title: ad.titleZh, subtitle: ad.subtitleZh, cta: ad.ctaZh } : locale === "ko" ? { title: ad.titleKo, subtitle: ad.subtitleKo, cta: ad.ctaKo } : { title: ad.title, subtitle: ad.subtitle, cta: ad.cta };
  const pos = (block: Block) => ({ left: `${layout[block].x}%`, top: `${layout[block].y}%` });

  function go() {
    const href = ad?.linkUrl?.trim() || "#best-sellers";
    const targetUrl = new URL(href, window.location.origin);
    const isCurrentPageAnchor = targetUrl.origin === window.location.origin && targetUrl.pathname === window.location.pathname && Boolean(targetUrl.hash);
    const target = isCurrentPageAnchor ? document.querySelector(targetUrl.hash) : null;

    if (target instanceof HTMLElement) {
      window.history.replaceState(null, "", targetUrl.hash);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.assign(href);
  }

  return <section className="mx-auto hidden max-w-[1280px] px-4 pt-3 sm:block sm:px-8">
    <div className="relative overflow-hidden rounded-xl border border-[#F8E2EA] bg-[#FFF5F8] shadow-[0_12px_36px_-16px_rgba(209,145,165,0.35)]">
      <img alt="Pangpangshop advertisement" className="h-[340px] w-full object-cover object-right sm:h-[420px] lg:h-[460px]" src={ad.imageUrl} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#FFF7FA]/95 via-[#FFF7FA]/75 to-transparent sm:w-[62%]" />
      <h1 className="absolute max-w-[52%] whitespace-pre-line font-display text-3xl font-bold leading-[1.12] tracking-tight text-[#5B3E3E] sm:text-5xl lg:text-[54px]" style={pos("title")}>{text.title}</h1>
      <p className="absolute max-w-[45%] text-sm font-medium text-[#6B4C4C] sm:text-base" style={pos("subtitle")}>{text.subtitle}<Heart className="ml-1 inline h-3.5 w-3.5 fill-[#F291AC] text-[#F291AC]" /></p>
      <button className="absolute inline-flex items-center gap-2 rounded-full bg-[#F291AC] px-7 py-3 font-display text-sm font-semibold text-white shadow-[0_6px_18px_-4px_rgba(242,145,165,0.75)] transition hover:bg-[#E67B99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F291AC] focus-visible:ring-offset-2 sm:text-base" onClick={go} style={pos("cta")} type="button">{text.cta}<ArrowRight className="h-4 w-4" /></button>
    </div>
  </section>;
}
