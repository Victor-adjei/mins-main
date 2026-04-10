const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkRows() {
  try {
    const res = await pool.query('SELECT * FROM customers LIMIT 2');
    console.log(res.rows);
  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    pool.end();
  }
}
checkRows();
