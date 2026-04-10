const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function describeTable() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'account_status'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    pool.end();
  }
}
describeTable();
