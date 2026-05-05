const { Pool } = require('pg'); 
const DATABASE_URL = 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

async function compareSums() {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const start = '2000-01-01'; // Far past
  const end = '2030-01-01'; // Far future
  
  console.log('Comparing for all transactions in range...');
  
  const sqlSum = await pool.query(`
    SELECT SUM(amount) as total 
    FROM transactions t
    JOIN accounts a ON t.account_number = a.account_number
    JOIN customers c ON a.customer = c.customer_number
    WHERE t.transaction_date::DATE BETWEEN $1 AND $2
    AND t.voided = false AND t.transaction_type = 'Deposit'
  `, [start, end]);
  
  const jsSumRes = await pool.query(`
    SELECT t.amount
    FROM transactions t
    JOIN accounts a ON t.account_number = a.account_number
    JOIN customers c ON a.customer = c.customer_number
    WHERE t.transaction_date::DATE BETWEEN $1 AND $2
    AND t.voided = false AND t.transaction_type = 'Deposit'
  `, [start, end]);
  
  const jsSum = jsSumRes.rows.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  console.log('SQL Sum:', sqlSum.rows[0].total);
  console.log('JS Sum:', jsSum);
  console.log('Count:', jsSumRes.rows.length);

  // Compare with Financial Summary style (no joins)
  const financialSum = await pool.query(`
    SELECT SUM(amount) as total 
    FROM transactions 
    WHERE voided = false AND transaction_type = 'Deposit'
  `);
  console.log('Financial Summary style Sum (No joins):', financialSum.rows[0].total);

  await pool.end();
}

compareSums().catch(console.error);
