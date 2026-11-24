"use client";
import { createContext, useContext, useEffect, useState } from "react";
export type Locale = "zh" | "en" | "ko";
const Context = createContext<{ locale: Locale; setLocale: (value: Locale) => void } | null>(null);
export function LocaleProvider({ children, initialLocale = "zh" }: { children: React.ReactNode; initialLocale?: Locale }) { const [locale, setLocaleState] = useState<Locale>(initialLocale); useEffect(() => { const saved = window.localStorage.getItem("pangpang_locale"); if ((saved === "zh" || saved === "en" || saved === "ko") && saved !== initialLocale) { setLocaleState(saved); document.cookie = `pangpang_locale=${saved}; path=/; max-age=31536000; samesite=lax`; } }, [initialLocale]); const setLocale = (value: Locale) => { setLocaleState(value); window.localStorage.setItem("pangpang_locale", value); document.cookie = `pangpang_locale=${value}; path=/; max-age=31536000; samesite=lax`; }; return <Context.Provider value={{ locale, setLocale }}>{children}</Context.Provider>; }
export function useLocale() { const value = useContext(Context); if (!value) throw new Error("Locale provider is missing"); return value; }
