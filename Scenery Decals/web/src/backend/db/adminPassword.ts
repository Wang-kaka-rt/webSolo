import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return { salt, hash: derivedKey.toString("hex") };
}

export async function verifyAdminPassword(password: string, salt: string, expectedHash: string) {
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const actualHash = Buffer.from(derivedKey.toString("hex"), "hex");
  const storedHash = Buffer.from(expectedHash, "hex");
  return actualHash.length === storedHash.length && timingSafeEqual(actualHash, storedHash);
}
