const { Pool } = require('pg'); 
const DATABASE_URL = 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

async function finalCheck() {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  // Current month range for May 2026
  const start = '2026-05-01';
  const end = '2026-05-31';

  console.log(`--- Checking Ledger for range ${start} to ${end} ---`);
  const res = await pool.query(`
      SELECT t.transaction_type, t.amount, t.transaction_date
      FROM transactions t
      JOIN accounts a ON t.account_number = a.account_number
      JOIN customers c ON a.customer = c.customer_number
      WHERE t.transaction_date::DATE BETWEEN $1 AND $2
      AND t.voided = false
  `, [start, end]);
  
  const transactions = res.rows;
  const totalDeposits = transactions.filter(t => t.transaction_type === 'Deposit').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const totalWithdrawals = transactions.filter(t => t.transaction_type === 'Withdrawal').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  
  console.log('Total Deposits:', totalDeposits);
  console.log('Total Withdrawals:', totalWithdrawals);
  console.log('Net Cash Flow:', totalDeposits - totalWithdrawals);
  console.log('Transaction Count:', transactions.length);

  console.log('\n--- Checking Financial Summary (All Time) ---');
  const stats = await pool.query(`
        SELECT 
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Deposit' AND voided = false) as total_deposits,
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Withdrawal' AND voided = false) as total_withdrawals
  `);
  console.log(stats.rows[0]);

  // Check if there are ANY transactions in May 2026 that might have been missed by the join
  const missedMay = await pool.query(`
    SELECT SUM(amount) as total
    FROM transactions
    WHERE transaction_date::DATE BETWEEN $1 AND $2
    AND voided = false AND transaction_type = 'Deposit'
  `, [start, end]);
  console.log('\nTotal May Deposits (No Joins):', missedMay.rows[0].total);

  await pool.end();
}

finalCheck().catch(console.error);
