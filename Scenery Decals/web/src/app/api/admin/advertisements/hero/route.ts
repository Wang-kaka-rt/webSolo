import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { AdvertisementInputError, getAdminHeroAdvertisement, updateHeroAdvertisement } from "@/backend/services/advertisementService";

export const runtime = "nodejs";
async function authorized() { const store = await cookies(); return verifyAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value); }
export async function GET() { if (!await authorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json({ advertisement: await getAdminHeroAdvertisement() }); }
export async function PATCH(request: Request) { if (!await authorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { return NextResponse.json({ advertisement: await updateHeroAdvertisement(await request.json()) }); } catch (error) { if (error instanceof AdvertisementInputError) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ error: "无法保存广告。" }, { status: 500 }); } }
