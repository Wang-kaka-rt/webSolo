import { NextRequest, NextResponse } from "next/server";
import { addToCart, clearCart, getCart, updateCartItem } from "@/backend/services/storeService";
import { StickerFinish } from "@/shared/types/store";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getSessionId(request: NextRequest): string {
  return request.headers.get("x-session-id") || "guest-session";
}

export async function GET(request: NextRequest) {
  const cart = getCart(getSessionId(request));
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    productId?: string;
    finish?: StickerFinish;
    quantity?: number;
  };

  if (!body.productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  await sleep(180);

  const cart = await addToCart(
    getSessionId(request),
    body.productId,
    body.finish,
    body.quantity ?? 1
  );

  if (!cart) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(cart);
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as {
    productId?: string;
    finish?: StickerFinish;
    quantity?: number;
  };

  if (!body.productId || !body.finish || typeof body.quantity !== "number") {
    return NextResponse.json({ error: "Invalid cart update payload" }, { status: 400 });
  }

  await sleep(120);

  const cart = updateCartItem(
    getSessionId(request),
    body.productId,
    body.finish,
    body.quantity
  );

  return NextResponse.json(cart);
}

export async function DELETE(request: NextRequest) {
  const cart = clearCart(getSessionId(request));
  return NextResponse.json(cart);
}
