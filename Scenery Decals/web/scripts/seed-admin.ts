import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { getMySqlPool } from "../src/backend/db/mysql";
import { hashAdminPassword } from "../src/backend/db/adminPassword";

config({ path: ".env.local", quiet: true });

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in .env.local before seeding an admin user.");
  }
  const { salt, hash } = await hashAdminPassword(password);
  await getMySqlPool().execute(
    `INSERT INTO admin_users (id, email, display_name, password_hash, password_salt, is_active)
     VALUES (?, ?, ?, ?, ?, TRUE)
     ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), password_hash = VALUES(password_hash), password_salt = VALUES(password_salt), is_active = TRUE`,
    [randomUUID(), email, "Pangpang 管理员", hash, salt]
  );
  console.log(`Admin user is ready for ${email}.`);
  await getMySqlPool().end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
