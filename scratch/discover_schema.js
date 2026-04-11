const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

async function discover() {
  try {
    console.log("--- DISCOVERING TABLES ---");
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables:", JSON.stringify(tables.rows.map(r => r.table_name), null, 2));

    for (const table of tables.rows) {
      console.log(`\n--- SCHEMA FOR: ${table.table_name} ---`);
      const cols = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table.table_name}'
        ORDER BY ordinal_position
      `);
      console.table(cols.rows);
    }

  } catch (err) {
    console.error("Discovery failed:", err);
  } finally {
    await pool.end();
  }
}

discover();
