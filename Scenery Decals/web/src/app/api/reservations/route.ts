import { NextResponse } from "next/server";
import { DatabaseConfigurationError } from "@/backend/db/mysql";
import { InventoryUnavailableError } from "@/backend/repositories/reservationRepository";
import { ReservationInputError, submitReservation } from "@/backend/services/reservationService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  try {
    const reservation = await submitReservation(body);
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    if (error instanceof ReservationInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof InventoryUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof DatabaseConfigurationError) {
      return NextResponse.json({ error: "Reservation service is not configured yet." }, { status: 503 });
    }
    console.error("Failed to create reservation", error);
    return NextResponse.json({ error: "Could not submit your reservation. Please try again later." }, { status: 500 });
  }
}
