import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/backend/services/storeService";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const finish = searchParams.get("finish");
  const q = searchParams.get("q");
  const section = searchParams.get("section");
  const sort = searchParams.get("sort");
  const localeParam = searchParams.get("locale");
  const locale = localeParam === "zh" || localeParam === "ko" ? localeParam : "en";

  await sleep(160);

  const products = await listProducts({ category, finish, q, section, sort, locale });
  return NextResponse.json({
    products,
    total: products.length,
  });
}
