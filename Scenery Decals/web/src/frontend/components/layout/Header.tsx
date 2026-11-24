"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useStore } from "@/frontend/context/StoreContext";
import { Product } from "@/shared/types/store";
import { useLocale } from "@/frontend/context/LocaleContext";
import { message } from "@/frontend/i18n/messages";

const STORE_LOGO_URL = "/assets/aistudio/Pangpangshop________32585569.png";

function Flag({ locale }: { locale: "zh" | "en" | "ko" }) {
  if (locale === "zh") return <svg aria-hidden="true" className="h-5 w-8 rounded-sm" viewBox="0 0 32 20"><rect width="32" height="20" fill="#de2910"/><path fill="#ffde00" d="m7 2 1.1 3.3h3.5L8.8 7.4l1.1 3.3L7 8.7l-2.9 2 1.1-3.3-2.8-2.1h3.5zM13 2l.35 1.05h1.1l-.9.65.35 1.05-.9-.65-.9.65.35-1.05-.9-.65h1.1zM15 5l.35 1.05h1.1l-.9.65.35 1.05-.9-.65-.9.65.35-1.05-.9-.65h1.1z"/></svg>;
  if (locale === "en") return <svg aria-hidden="true" className="h-5 w-8 rounded-sm" viewBox="0 0 32 20"><rect width="32" height="20" fill="#012169"/><path d="M0 0 32 20M32 0 0 20" stroke="#fff" strokeWidth="4"/><path d="M0 0 32 20M32 0 0 20" stroke="#c8102e" strokeWidth="1.6"/><path d="M16 0v20M0 10h32" stroke="#fff" strokeWidth="6"/><path d="M16 0v20M0 10h32" stroke="#c8102e" strokeWidth="3"/></svg>;
  return <svg aria-hidden="true" className="h-5 w-8 rounded-sm border border-slate-200" viewBox="0 0 32 20"><rect width="32" height="20" fill="#fff"/><circle cx="16" cy="10" r="5" fill="#cd2e3a"/><path d="M16 10a5 5 0 0 0 4.3 2.5A5 5 0 0 1 16 15a5 5 0 0 1 0-10 5 5 0 0 0-4.3 2.5A5 5 0 0 0 16 10" fill="#0047a0"/><g stroke="#111" strokeWidth="1.2"><path d="m4 4 3 3m-4-1 3 3m-4-1 3 3M25 13l3 3m-4-1 3 3M25 4l3 3m-4-1 3 3M4 13l3 3m-4-1 3 3"/></g></svg>;
}

function SearchDropdown({ isSearching, query, results, onSelect, mobile = false }: { isSearching: boolean; query: string; results: Product[]; onSelect: () => void; mobile?: boolean }) {
  return <div className={`absolute top-full z-50 mt-2 overflow-hidden rounded-lg border border-[#F3DCE4] bg-white shadow-xl ${mobile ? "left-4 right-4" : "right-0 w-80"}`}>
    <div className="border-b border-[#FAF0F3] px-4 py-2 text-xs font-medium text-[#8B6D6D]">{isSearching ? "Searching sticker packs..." : `${results.length} result${results.length === 1 ? "" : "s"} for \"${query}\"`}</div>
    <div className="max-h-72 overflow-y-auto p-2">
      {!isSearching && results.length === 0 ? <p className="px-3 py-5 text-center text-xs text-[#9C7D7D]">No stickers matched your search.</p> : results.map((product) => <Link key={product.id} href={`/products/${product.slug}`} onClick={onSelect} className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-[#FFF5F8]"><img src={product.image} alt={product.title} referrerPolicy="no-referrer" className="h-11 w-11 shrink-0 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#5B3E3E]">{product.title}</p><p className="text-[11px] text-[#9C7D7D]">{product.categoryLabel}</p></div><span className="text-xs font-semibold text-[#5B3E3E] tabular-nums">${product.price.toFixed(2)}</span></Link>)}
    </div>
  </div>;
}

export function Header() {
  const { openInfoModal } = useStore();
  const { locale, setLocale } = useLocale();
  const copy = message(locale);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const isInDesktopSearch = searchRef.current?.contains(e.target as Node);
      const isInMobileSearch = mobileSearchRef.current?.contains(e.target as Node);
      if (!isInDesktopSearch && !isInMobileSearch) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Debounced async live search against /api/products?q=...
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?q=${encodeURIComponent(trimmed)}&locale=${locale}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = (await res.json()) as { products: Product[] };
          setSearchResults(data.products);
          setIsSearchOpen(true);
        }
      } catch {
        // Ignore aborted requests
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [locale, searchQuery]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#F7E5EB] bg-[#FFFDFB]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-4 py-2.5 sm:px-8">
        {/* Zone 1: Uploaded Pangpangshop Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center transition-transform duration-200 hover:scale-[1.02]"
          aria-label="Pangpangshop Home"
        >
          <img
            src={STORE_LOGO_URL}
            alt="Pangpangshop"
            referrerPolicy="no-referrer"
            className="h-12 w-auto object-contain sm:h-14"
          />
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#5B3E3E] lg:flex">
          <Link href="/categories" className="whitespace-nowrap shrink-0 py-1.5 transition-colors hover:text-[#E67B99]">{copy.allProducts}</Link>

          <button
            type="button"
            onClick={() => openInfoModal("about")}
            className="whitespace-nowrap shrink-0 py-1.5 transition-colors hover:text-[#E67B99]"
          >
            {copy.about}
          </button>
        </nav>

        {/* Zone 3: Async Search, Account & Cart */}
        <div className="flex items-center gap-3">
          <div ref={searchRef} className="relative hidden rounded-md border border-[#EDD3DC] bg-white shadow-sm transition-colors focus-within:border-[#F291AC] sm:block">
            <div className="flex items-center px-3.5 py-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) setIsSearchOpen(true);
                }}
                placeholder={copy.search}
                aria-label={copy.search}
                className="w-36 bg-transparent text-xs text-[#5B3E3E] placeholder:text-[#B39595] focus:outline-none md:w-48"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  aria-label="Clear search"
                  className="ml-1 text-[#A48484] hover:text-[#5B3E3E]"
                >
                  {isSearching ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : (
                <Search className="ml-1 h-3.5 w-3.5 text-[#D89AAE]" />
              )}
            </div>

            {isSearchOpen && searchQuery.trim() && <SearchDropdown isSearching={isSearching} query={searchQuery.trim()} results={searchResults} onSelect={() => setIsSearchOpen(false)} />}
          </div>

          <div className="relative">
            <button aria-expanded={isLanguageOpen} aria-label="切换语言" className="flex h-10 w-10 items-center justify-center bg-transparent" onClick={() => setIsLanguageOpen((open) => !open)} type="button"><Flag locale={locale} /></button>
            {isLanguageOpen && <div className="absolute right-0 top-12 z-50 flex border border-[#F3DCE4] bg-white p-1 shadow-lg">{(["zh", "en", "ko"] as const).map((item) => <button aria-label={`切换为${item}`} className="p-2 hover:bg-[#FFF2F6]" key={item} onClick={() => { setLocale(item); setIsLanguageOpen(false); }} type="button"><Flag locale={item} /></button>)}</div>}
          </div>
        </div>
      </div>
      <div ref={mobileSearchRef} className="relative mx-auto flex max-w-[1280px] items-center gap-2 px-4 pb-2.5 sm:hidden">
        <div className="flex min-w-0 flex-1 items-center rounded-md border border-[#EDD3DC] bg-white px-3 py-2 focus-within:border-[#F291AC]">
          <Search className="mr-2 h-4 w-4 shrink-0 text-[#D89AAE]" />
          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => { if (searchQuery.trim()) setIsSearchOpen(true); }} placeholder={copy.search} aria-label={copy.search} className="min-w-0 flex-1 bg-transparent text-sm text-[#5B3E3E] placeholder:text-[#B39595] focus:outline-none" />
          {searchQuery && <button type="button" onClick={() => { setSearchQuery(""); setSearchResults([]); setIsSearchOpen(false); }} aria-label="Clear search" className="ml-2 text-[#A48484] hover:text-[#5B3E3E]">{isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}</button>}
        </div>
        <Link href="/categories" className="shrink-0 rounded-md bg-[#F291AC] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#E67B99]">{copy.allProducts}</Link>
        {isSearchOpen && searchQuery.trim() && <SearchDropdown isSearching={isSearching} mobile query={searchQuery.trim()} results={searchResults} onSelect={() => setIsSearchOpen(false)} />}
      </div>
    </header>
  );
}
