import { NextResponse } from "next/server";
import { getAdminHeroAdvertisement } from "@/backend/services/advertisementService";

export const runtime = "nodejs";
export async function GET() { const advertisement = await getAdminHeroAdvertisement(); return NextResponse.json({ advertisement: advertisement?.isActive ? advertisement : null }); }
