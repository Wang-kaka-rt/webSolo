import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { uploadCategoryImage } from "@/backend/storage/ftpImageStorage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const slug = formData.get("slug");
    if (!(image instanceof File) || typeof slug !== "string") {
      return NextResponse.json({ error: "请提供分类标识和图片。" }, { status: 400 });
    }
    return NextResponse.json({ imageUrl: await uploadCategoryImage({ slug, file: image }) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "图片上传失败。" }, { status: 400 });
  }
}
