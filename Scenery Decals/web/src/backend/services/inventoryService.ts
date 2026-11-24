import "server-only";

import { z } from "zod";
import { expireOpenReservations } from "@/backend/db/reservationExpiry";
import { addAdminInventory, adjustAdminInventory, listAdminInventory } from "@/backend/repositories/reservationRepository";

const inventoryUpdateSchema = z.object({
  onHandQuantity: z.coerce.number().int().min(0).max(100000),
  reason: z.string().trim().max(500).optional(),
});
const inventoryAdditionSchema = z.object({
  adjustmentQuantity: z.coerce.number().int().min(1).max(100000),
  reason: z.string().trim().max(500).optional(),
});

export class InventoryInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryInputError";
  }
}

export async function getAdminInventory() {
  return listAdminInventory();
}

export async function saveAdminInventory(productId: string, rawInput: unknown) {
  const addition = inventoryAdditionSchema.safeParse(rawInput);
  if (addition.success) return addAdminInventory(productId, { quantity: addition.data.adjustmentQuantity, reason: addition.data.reason });
  const parsed = inventoryUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new InventoryInputError(parsed.error.issues[0]?.message ?? "库存数量不正确。");
  }
  return adjustAdminInventory(productId, parsed.data);
}

export async function expireReservations() {
  return expireOpenReservations();
}
