import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { AdminReservationInputError, saveAdminReservation } from "@/backend/services/adminReservationService";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/reservations/[id]">) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    await saveAdminReservation(id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminReservationInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Reservation was not found.") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error && error.message === "A completed reservation cannot be reopened.") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Failed to update reservation", error);
    return NextResponse.json({ error: "Could not update reservation." }, { status: 500 });
  }
}
