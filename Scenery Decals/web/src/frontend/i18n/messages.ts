import type { Locale } from "@/frontend/context/LocaleContext";
import zh from "./zh.json";
import en from "./en.json";
import ko from "./ko.json";
const messages = { zh, en, ko } as const;
export function message(locale: Locale) { return messages[locale]; }
