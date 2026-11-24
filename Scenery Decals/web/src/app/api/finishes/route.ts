import { NextResponse } from "next/server";
import { listStoreFinishes } from "@/backend/services/storeService";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ finishes: await listStoreFinishes() });
}
