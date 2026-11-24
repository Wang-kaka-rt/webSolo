import "server-only";

import { Readable } from "node:stream";
import { basename, dirname, extname, posix } from "node:path";
import * as ftp from "basic-ftp";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const allowedTypes = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"], ["image/gif", ".gif"]]);

function value(name: string) { const configured = process.env[name]?.trim(); if (!configured) throw new Error(`${name} is not configured.`); return configured; }
function safeSegment(value: string) { return value.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""); }
function mediaUrl(remotePath: string) { return `/api/media/${remotePath}`; }

export async function uploadProductMainImage(input: { category: string; slug: string; file: File }) {
  if (!allowedTypes.has(input.file.type)) throw new Error("仅支持 JPG、PNG、WebP 或 GIF 图片。");
  if (input.file.size === 0 || input.file.size > MAX_IMAGE_BYTES) throw new Error("图片大小需介于 1 字节至 8MB 之间。");
  const extension = allowedTypes.get(input.file.type) ?? extname(input.file.name).toLowerCase();
  const fileName = `${Date.now()}-${safeSegment(basename(input.file.name, extname(input.file.name))) || "product"}${extension}`;
  const remotePath = posix.join("images", "products", safeSegment(input.category), safeSegment(input.slug), "main", fileName);
  const client = new ftp.Client(20_000);
  client.ftp.verbose = false;
  try {
    await client.access({ host: value("FTP_HOST"), port: Number(process.env.FTP_PORT ?? "21"), user: value("FTP_USER"), password: value("FTP_PASSWORD"), secure: false });
    await client.ensureDir(dirname(remotePath));
    await client.uploadFrom(Readable.from([Buffer.from(await input.file.arrayBuffer())]), basename(remotePath));
  } finally { client.close(); }
  return mediaUrl(remotePath);
}

export async function uploadHeroAdvertisementImage(file: File) {
  if (!allowedTypes.has(file.type)) throw new Error("仅支持 JPG、PNG、WebP 或 GIF 图片。");
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) throw new Error("图片大小需介于 1 字节至 8MB 之间。");
  const extension = allowedTypes.get(file.type) ?? extname(file.name).toLowerCase();
  const fileName = `${Date.now()}-${safeSegment(basename(file.name, extname(file.name))) || "hero"}${extension}`;
  const remotePath = posix.join("images", "banners", "hero", fileName);
  const client = new ftp.Client(20_000);
  client.ftp.verbose = false;
  try {
    await client.access({ host: value("FTP_HOST"), port: Number(process.env.FTP_PORT ?? "21"), user: value("FTP_USER"), password: value("FTP_PASSWORD"), secure: false });
    await client.ensureDir(dirname(remotePath));
    await client.uploadFrom(Readable.from([Buffer.from(await file.arrayBuffer())]), basename(remotePath));
  } finally { client.close(); }
  return mediaUrl(remotePath);
}

export async function uploadCategoryImage(input: { slug: string; file: File }) {
  if (!allowedTypes.has(input.file.type)) throw new Error("仅支持 JPG、PNG、WebP 或 GIF 图片。");
  if (input.file.size === 0 || input.file.size > MAX_IMAGE_BYTES) throw new Error("图片大小需介于 1 字节至 8MB 之间。");
  const categorySlug = safeSegment(input.slug);
  if (!categorySlug) throw new Error("请先填写有效的分类标识。");
  const extension = allowedTypes.get(input.file.type) ?? extname(input.file.name).toLowerCase();
  const fileName = `${Date.now()}-${safeSegment(basename(input.file.name, extname(input.file.name))) || "category"}${extension}`;
  const remotePath = posix.join("images", "categories", categorySlug, fileName);
  const client = new ftp.Client(20_000);
  client.ftp.verbose = false;
  try {
    await client.access({ host: value("FTP_HOST"), port: Number(process.env.FTP_PORT ?? "21"), user: value("FTP_USER"), password: value("FTP_PASSWORD"), secure: false });
    await client.ensureDir(dirname(remotePath));
    await client.uploadFrom(Readable.from([Buffer.from(await input.file.arrayBuffer())]), basename(remotePath));
  } finally { client.close(); }
  return mediaUrl(remotePath);
}
