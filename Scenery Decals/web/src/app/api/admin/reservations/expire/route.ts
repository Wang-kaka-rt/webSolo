import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { expireReservations } from "@/backend/services/inventoryService";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expiredCount = await expireReservations();
    return NextResponse.json({ expiredCount });
  } catch (error) {
    console.error("Failed to expire reservations", error);
    return NextResponse.json({ error: "Could not release expired reservations." }, { status: 500 });
  }
}
