import "server-only";

import { z } from "zod";
import { createReservation } from "@/backend/repositories/reservationRepository";
import type { CreateReservationInput, ReservationConfirmation } from "@/shared/types/reservation";

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength).optional().transform((value) => value || undefined);

const reservationSchema = z
  .object({
    items: z.array(z.object({
      productId: z.string().trim().min(1).max(80),
      finish: optionalText(80),
      quantity: z.coerce.number().int().min(1).max(20),
    })).min(1).max(20),
    contact: z.object({
      name: z.string().trim().min(2).max(120),
      email: optionalText(254).refine(
        (value) => !value || z.string().email().safeParse(value).success,
        "Enter a valid email address."
      ),
      phone: optionalText(40),
      wechat: optionalText(80),
      kakaoTalk: optionalText(80),
      whatsapp: optionalText(80),
      note: optionalText(1000),
    }).superRefine((contact, ctx) => {
      if (!contact.email && !contact.phone && !contact.wechat && !contact.kakaoTalk && !contact.whatsapp) {
        ctx.addIssue({ code: "custom", message: "Provide an email address, KakaoTalk ID, WhatsApp number, phone number, or WeChat ID.", path: ["email"] });
      }
    }),
  })
  .transform((value): CreateReservationInput => {
    const itemsByKey = new Map<string, (typeof value.items)[number]>();
    for (const item of value.items) {
      const key = `${item.productId}:${item.finish ?? ""}`;
      const previous = itemsByKey.get(key);
      itemsByKey.set(key, { ...item, quantity: (previous?.quantity ?? 0) + item.quantity });
    }
    return { ...value, items: [...itemsByKey.values()] };
  });

export class ReservationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationInputError";
  }
}

function reservationHoldHours() {
  const parsed = Number(process.env.RESERVATION_HOLD_HOURS ?? "48");
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 168 ? parsed : 48;
}

export async function submitReservation(rawInput: unknown): Promise<ReservationConfirmation> {
  const parsed = reservationSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ReservationInputError(parsed.error.issues[0]?.message ?? "Invalid reservation.");
  }
  return createReservation(parsed.data, reservationHoldHours());
}
