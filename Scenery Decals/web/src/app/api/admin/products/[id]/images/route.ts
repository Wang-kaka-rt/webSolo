import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { uploadProductMainImage } from "@/backend/storage/ftpImageStorage";
import { getAdminProductById, saveProductImage } from "@/backend/services/productService";

export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params; const product = await getAdminProductById(id);
    if (!product) return NextResponse.json({ error: "商品不存在。" }, { status: 404 });
    const file = (await request.formData()).get("image");
    if (!(file instanceof File)) return NextResponse.json({ error: "请选择图片文件。" }, { status: 400 });
    const imageUrl = await uploadProductMainImage({ category: product.category, slug: product.slug, file });
    const updated = await saveProductImage(id, imageUrl);
    return NextResponse.json({ imageUrl, product: updated });
  } catch (error) { console.error("Failed to upload product image", error); return NextResponse.json({ error: error instanceof Error ? error.message : "图片上传失败。" }, { status: 500 }); }
}
