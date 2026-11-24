import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "评价功能目前未启用。" }, { status: 410 });
}
