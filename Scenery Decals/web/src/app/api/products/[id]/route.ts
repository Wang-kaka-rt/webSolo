import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/backend/services/storeService";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const localeParam = new URL(_request.url).searchParams.get("locale");
  const locale = localeParam === "zh" || localeParam === "ko" ? localeParam : "en";
  const product = await getProductById(id, locale);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
