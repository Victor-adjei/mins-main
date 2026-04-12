const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

async function inspectSchema() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Inspecting all account_number columns ---');
    
    const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE column_name = 'account_number'
      ORDER BY table_name;
    `);
    
    console.table(res.rows);

  } catch (err) {
    console.error('Inspection Error:', err);
  } finally {
    await pool.end();
  }
}

inspectSchema();
