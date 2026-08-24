const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function addColumns() {
  try {
    console.log('Altering customers table...');
    await pool.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS next_of_kin VARCHAR(255),
      ADD COLUMN IF NOT EXISTS next_of_kin_phone VARCHAR(50);
    `);
    console.log('Columns added successfully (or already existed).');
  } catch(e) {
    console.error('MIGRATION ERROR:', e);
  } finally {
    pool.end();
  }
}
addColumns();
