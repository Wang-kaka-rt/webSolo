import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { createProduct, ProductInputError } from "@/backend/services/productService";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ product: await createProduct(await request.json()) }, { status: 201 }); }
  catch (error) {
    if (error instanceof ProductInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof Error && /duplicate/i.test(error.message)) return NextResponse.json({ error: "该商品链接已被使用，请换一个。" }, { status: 409 });
    console.error("Failed to create product", error); return NextResponse.json({ error: "无法创建商品。" }, { status: 500 });
  }
}
