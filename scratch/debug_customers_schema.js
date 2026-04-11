const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

async function debugSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'customers'
    `);
    console.table(res.rows);
  } catch (err) {
    console.error("Failed:", err);
  } finally {
    await pool.end();
  }
}

debugSchema();
