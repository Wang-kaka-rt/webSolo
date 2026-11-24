import { NextRequest, NextResponse } from "next/server";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
    return NextResponse.json(
      { error: "Please fill out all fields before sending." },
      { status: 400 }
    );
  }

  await sleep(240);

  return NextResponse.json({
    ok: true,
    ticketId: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
    reply: `Thank you, ${body.name.trim()}! Our studio team received your note and will reply within 24 hours.`,
  });
}
