import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { InventoryUnavailableError } from "@/backend/repositories/reservationRepository";
import { InventoryInputError, saveAdminInventory } from "@/backend/services/inventoryService";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/inventory/[id]">) {
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
    const inventory = await saveAdminInventory(id, body);
    return NextResponse.json({ inventory });
  } catch (error) {
    if (error instanceof InventoryInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof InventoryUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof Error && error.message === "Product inventory was not found.") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Failed to adjust inventory", error);
    return NextResponse.json({ error: "Could not adjust inventory." }, { status: 500 });
  }
}
