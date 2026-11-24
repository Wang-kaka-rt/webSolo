import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { ProductInputError, saveProductPrice } from "@/backend/services/productService";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/products/[id]/quick-update">) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    const product = await saveProductPrice(id, await request.json());
    return product ? NextResponse.json({ product }) : NextResponse.json({ error: "商品不存在。" }, { status: 404 });
  } catch (error) {
    if (error instanceof ProductInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Failed to update product price", error);
    return NextResponse.json({ error: "无法保存价格。" }, { status: 500 });
  }
}
