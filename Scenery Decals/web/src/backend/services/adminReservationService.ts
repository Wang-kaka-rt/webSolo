import "server-only";

import { z } from "zod";
import { listAdminReservations, listAdminReservationsPage, updateAdminReservation } from "@/backend/repositories/reservationRepository";

const reservationStatusSchema = z.enum([
  "submitted",
  "notified",
  "contacted",
  "confirmed",
  "fulfilled",
  "cancelled",
  "expired",
  "declined",
]);

const adminReservationUpdateSchema = z.object({
  status: reservationStatusSchema,
  adminNote: z.string().trim().max(3000).optional(),
});

export class AdminReservationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminReservationInputError";
  }
}

export async function getAdminReservations() {
  return listAdminReservations();
}
export async function getAdminReservationsPage(page: number, pageSize: number, search?: string) { return listAdminReservationsPage({ page, pageSize, search }); }

export async function saveAdminReservation(id: string, rawInput: unknown) {
  const parsed = adminReservationUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new AdminReservationInputError(parsed.error.issues[0]?.message ?? "Invalid reservation update.");
  }
  await updateAdminReservation(id, parsed.data);
}
