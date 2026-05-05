const { Pool } = require('pg'); 
const DATABASE_URL = 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

async function checkData() {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  console.log('--- Transaction Types ---');
  const res = await pool.query('SELECT DISTINCT transaction_type FROM transactions');
  console.log(res.rows);
  
  console.log('\n--- Counts and Sums Grouped by Type ---');
  const counts = await pool.query('SELECT transaction_type, COUNT(*), SUM(amount) FROM transactions WHERE voided = false GROUP BY transaction_type');
  console.table(counts.rows);

  console.log('\n--- Financial Summary Style (All Time) ---');
  const stats = await pool.query(`
        SELECT 
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Deposit' AND voided = false) as total_deposits,
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Withdrawal' AND voided = false) as total_withdrawals
  `);
  console.log(stats.rows[0]);

  console.log('\n--- Ledger Style with Joins (All Time) ---');
  const ledgerStats = await pool.query(`
    SELECT 
      t.transaction_type,
      SUM(t.amount) as total_amount
    FROM transactions t
    JOIN accounts a ON t.account_number = a.account_number
    JOIN customers c ON a.customer = c.customer_number
    WHERE t.voided = false
    GROUP BY t.transaction_type
  `);
  console.table(ledgerStats.rows);

  await pool.end();
}

checkData().catch(console.error);
