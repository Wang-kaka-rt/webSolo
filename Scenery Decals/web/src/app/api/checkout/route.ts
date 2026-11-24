import { NextRequest, NextResponse } from "next/server";
import { getOrders, placeOrder } from "@/backend/services/storeService";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getSessionId(request: NextRequest): string {
  return request.headers.get("x-session-id") || "guest-session";
}

export async function GET(request: NextRequest) {
  const orders = getOrders(getSessionId(request));
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    address?: string;
  };

  if (!body.name?.trim() || !body.email?.trim() || !body.address?.trim()) {
    return NextResponse.json(
      { error: "Please complete your name, email, and shipping address." },
      { status: 400 }
    );
  }

  await sleep(320);

  const order = placeOrder(getSessionId(request), {
    name: body.name,
    email: body.email,
    address: body.address,
  });

  if (!order) {
    return NextResponse.json(
      { error: "Your cart is empty. Add a sticker pack before checking out." },
      { status: 400 }
    );
  }

  return NextResponse.json({ order });
}
