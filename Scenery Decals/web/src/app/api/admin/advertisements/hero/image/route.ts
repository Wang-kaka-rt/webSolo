import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { uploadHeroAdvertisementImage } from "@/backend/storage/ftpImageStorage";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const store = await cookies();
  if (!verifyAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const formData = await request.formData(); const file = formData.get("image"); if (!(file instanceof File)) return NextResponse.json({ error: "请选择图片。" }, { status: 400 }); return NextResponse.json({ imageUrl: await uploadHeroAdvertisementImage(file) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "上传失败。" }, { status: 500 }); }
}
