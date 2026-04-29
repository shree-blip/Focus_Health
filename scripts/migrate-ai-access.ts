import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

// Load env manually from .env.local
const envPath = join(process.cwd(), ".env.local");
const envLines = readFileSync(envPath, "utf-8").split("\n");
for (const line of envLines) {
  const [k, ...rest] = line.split("=");
  if (k && !k.startsWith("#")) process.env[k.trim()] = rest.join("=").trim();
}

const pool = new Pool({
  host: process.env.DB_HOST || "104.197.216.35",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "focus_app",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "focus_health",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await pool.query(
      `ALTER TABLE lop_users ADD COLUMN IF NOT EXISTS ai_access BOOLEAN NOT NULL DEFAULT FALSE`
    );
    console.log("✅ Column ai_access added (or already existed)");

    const { rowCount } = await pool.query(
      `UPDATE lop_users SET ai_access = TRUE WHERE role = 'admin'`
    );
    console.log(`✅ Set ai_access=TRUE on ${rowCount} admin user(s)`);

    const { rows } = await pool.query(
      `SELECT email, role, ai_access FROM lop_users ORDER BY role, email`
    );
    console.log("\nUser AI access status:");
    for (const r of rows) {
      console.log(`  ${String(r.email).padEnd(40)} role=${String(r.role).padEnd(20)} ai_access=${r.ai_access}`);
    }
  } catch (err) {
    console.error("❌ Migration failed:", (err as Error).message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
