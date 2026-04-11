const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

async function checkConstraints() {
  try {
    const res = await pool.query(`
      SELECT 
        conname as constraint_name, 
        pg_get_constraintdef(c.oid) as definition
      FROM pg_constraint c 
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public' 
      AND t.relname = 'customers'
    `);
    console.table(res.rows);
  } catch (err) {
    console.error("Failed:", err);
  } finally {
    await pool.end();
  }
}

checkConstraints();
