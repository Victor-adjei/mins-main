const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

async function checkData() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Checking Transaction and Account Data ---');
    
    const res = await pool.query(`
      SELECT 
        t.transaction_id, 
        t.account_number as trans_raw_val,
        a.account_id,
        a.account_number as acc_display_num
      FROM transactions t
      LEFT JOIN accounts a ON t.account_number = a.account_id
      LIMIT 10;
    `);
    
    console.table(res.rows);

  } catch (err) {
    console.error('Data Check Error:', err);
  } finally {
    await pool.end();
  }
}

checkData();
