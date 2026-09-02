import { Pool } from "pg";

/**
 * Single shared connection pool. Reused across Server Actions/Components
 * within the same process — never create a new Pool per request.
 */
declare global {
  var __pgPool: Pool | undefined;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function db(): Pool {
  if (!isDbConfigured()) {
    throw new Error("DATABASE_URL is not set — see .env.local.");
  }

  if (!global.__pgPool) {
    global.__pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return global.__pgPool;
}
