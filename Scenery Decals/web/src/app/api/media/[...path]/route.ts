import { Writable } from "node:stream";
import { extname } from "node:path";
import * as ftp from "basic-ftp";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
};

function config(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const remotePath = path.join("/");
  if (!/^images\/(?:products|categories|banners\/hero)\/[a-z0-9._/-]+$/i.test(remotePath) || remotePath.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }
  const chunks: Buffer[] = [];
  const target = new Writable({ write(chunk, _encoding, callback) { chunks.push(Buffer.from(chunk)); callback(); } });
  const client = new ftp.Client(20_000);
  client.ftp.verbose = false;
  try {
    await client.access({ host: config("FTP_HOST"), port: Number(process.env.FTP_PORT ?? "21"), user: config("FTP_USER"), password: config("FTP_PASSWORD"), secure: false });
    await client.downloadTo(target, remotePath);
    return new NextResponse(Buffer.concat(chunks), {
      headers: { "Content-Type": contentTypes[extname(remotePath).toLowerCase()] ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  } finally {
    client.close();
  }
}
