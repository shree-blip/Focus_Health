import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: "104.197.216.35",
  port: 5432,
  user: "focus_app",
  password: "FocusHealth2026!$ecure",
  database: "focus_health",
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(
    `ALTER TABLE lop_users ADD COLUMN IF NOT EXISTS ai_access BOOLEAN NOT NULL DEFAULT FALSE`
  );
  console.log("✅ Column ai_access added (or already existed)");

  const { rowCount } = await pool.query(
    `UPDATE lop_users SET ai_access = TRUE WHERE role = 'admin'`
  );
  console.log(`✅ Set ai_access=TRUE on ${rowCount} admin user(s)`);

  // Verify
  const { rows } = await pool.query(
    `SELECT id, email, role, ai_access FROM lop_users ORDER BY role, email`
  );
  console.log("\nCurrent users:");
  for (const r of rows) {
    console.log(`  ${r.email} | role=${r.role} | ai_access=${r.ai_access}`);
  }
} catch (err) {
  console.error("Migration failed:", err.message);
} finally {
  await pool.end();
}
