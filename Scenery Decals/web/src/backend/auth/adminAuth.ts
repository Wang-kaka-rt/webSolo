import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { verifyAdminPassword } from "@/backend/db/adminPassword";
import { getMySqlPool } from "@/backend/db/mysql";

export const ADMIN_SESSION_COOKIE = "pangpang_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

interface AdminUserRow extends RowDataPacket {
  id: string;
  password_hash: string;
  password_salt: string;
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || null;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isAdminAuthConfigured() {
  return Boolean(sessionSecret());
}

export async function authenticateAdmin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;
  const [rows] = await getMySqlPool().execute<AdminUserRow[]>(
    `SELECT id, password_hash, password_salt
     FROM admin_users
     WHERE email = ? AND is_active = TRUE
     LIMIT 1`,
    [normalizedEmail]
  );
  const admin = rows[0];
  if (!admin || !(await verifyAdminPassword(password, admin.password_salt, admin.password_hash))) {
    return null;
  }
  return { id: admin.id };
}

export function createAdminSession(adminId: string) {
  const secret = sessionSecret();
  if (!secret) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `admin.${adminId}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSession(session: string | undefined) {
  const secret = sessionSecret();
  if (!session || !secret) return false;
  const [role, adminId, expiresAtText, signature, ...rest] = session.split(".");
  const expiresAt = Number(expiresAtText);
  if (rest.length > 0 || role !== "admin" || !adminId || !Number.isInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }
  return safeEqual(signature, sign(`${role}.${adminId}.${expiresAt}`, secret));
}

export const adminSessionMaxAge = SESSION_MAX_AGE_SECONDS;
