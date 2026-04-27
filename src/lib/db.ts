import { Pool } from 'pg';

// Cloud SQL connection
// In Cloud Run, use the Unix socket via Cloud SQL connector
// Locally, use TCP with the public IP
const isCloudRun = !!process.env.CLOUD_SQL_CONNECTION_NAME;

const pool = new Pool(
  isCloudRun
    ? {
        host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'focus_health',
        max: 10,
      }
    : {
        host: process.env.DB_HOST || '104.197.216.35',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'focus_app',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'focus_health',
        ssl: { rejectUnauthorized: false },
        max: 10,
      }
);

export default pool;

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
