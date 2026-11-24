import "server-only";

import { cookies } from "next/headers";
import type { StoreLocale } from "@/backend/services/storeService";

export async function getRequestLocale(): Promise<StoreLocale> {
  const value = (await cookies()).get("pangpang_locale")?.value;
  return value === "en" || value === "ko" ? value : "zh";
}
