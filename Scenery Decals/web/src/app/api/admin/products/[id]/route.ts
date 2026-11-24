import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { ProductInputError, updateProduct } from "@/backend/services/productService";

export const runtime = "nodejs";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params; const product = await updateProduct(id, await request.json());
    return product ? NextResponse.json({ product }) : NextResponse.json({ error: "商品不存在。" }, { status: 404 });
  } catch (error) {
    if (error instanceof ProductInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof Error && /duplicate/i.test(error.message)) return NextResponse.json({ error: "该商品链接已被使用，请换一个。" }, { status: 409 });
    console.error("Failed to update product", error); return NextResponse.json({ error: "无法保存商品。" }, { status: 500 });
  }
}
