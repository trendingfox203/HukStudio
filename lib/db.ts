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
    // Một số Postgres quản lý (vd Neon qua pooler) có thể để search_path rỗng
    // theo mặc định cho role, khiến câu lệnh không ghi rõ schema báo "relation
    // does not exist" — ép lại đúng schema public cho mọi kết nối mới.
    global.__pgPool.on("connect", (client) => {
      client.query("SET search_path TO public").catch(() => {});
    });
  }
  return global.__pgPool;
}
