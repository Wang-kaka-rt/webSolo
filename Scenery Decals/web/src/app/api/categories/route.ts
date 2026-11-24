import { NextRequest, NextResponse } from "next/server";
import { listStoreCategories } from "@/backend/services/storeService";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const localeParam = new URL(request.url).searchParams.get("locale");
  const locale = localeParam === "zh" || localeParam === "ko" ? localeParam : "en";
  return NextResponse.json({ categories: await listStoreCategories(locale) });
}
