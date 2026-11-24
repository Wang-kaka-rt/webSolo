import { config } from "dotenv";
import { getMySqlPool } from "../src/backend/db/mysql";
import { expireOpenReservations } from "../src/backend/db/reservationExpiry";

config({ path: ".env.local", quiet: true });

async function main() {
  const expiredCount = await expireOpenReservations();
  console.log(`Expired ${expiredCount} reservation(s) and released their inventory.`);
  await getMySqlPool().end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
