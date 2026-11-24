import mysql, { type Pool } from "mysql2/promise";

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

let pool: Pool | undefined;

function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new DatabaseConfigurationError(
      "DATABASE_URL is not configured. Add your MySQL connection string to .env.local."
    );
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new DatabaseConfigurationError("DATABASE_URL must be a valid MySQL URL.");
  }

  if (url.protocol !== "mysql:" || !url.hostname || !url.pathname || url.pathname === "/") {
    throw new DatabaseConfigurationError(
      "DATABASE_URL must use mysql:// and include a host and database name."
    );
  }

  return url;
}

export function getMySqlPool() {
  if (pool) return pool;

  const url = databaseUrl();
  pool = mysql.createPool({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
    charset: "utf8mb4",
  });

  return pool;
}

/**
 * Recreates the pool after a transient remote-MySQL disconnect. The old pool
 * is closed first so the application does not keep retrying a dead socket.
 */
export async function reconnectMySqlPool() {
  const previousPool = pool;
  pool = undefined;

  if (previousPool) {
    try {
      await previousPool.end();
    } catch {
      // The remote server may already have closed the socket. A fresh pool is
      // still safe to create below.
    }
  }

  return getMySqlPool();
}
