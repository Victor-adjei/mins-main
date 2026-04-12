const { Pool } = require('pg');

// Manually define the pool since I can't easily import the shared db.ts which might be TS/ESM
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

async function test() {
  try {
    const stats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM customers) as total_customers,
          (SELECT COUNT(*) FROM accounts) as total_accounts,
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Deposit' AND voided = false) as total_deposits,
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Withdrawal' AND voided = false) as total_withdrawals,
          (SELECT SUM(loan_amount) FROM loans) as total_loans
      `);
    console.log('Stats:', stats.rows[0]);

    const accounts = await query(`
        SELECT a.account_number, c.first_name, c.surname, a.balance 
        FROM accounts a 
        JOIN customers c ON a.customer = c.customer_number 
        ORDER BY a.balance DESC
      `);
    console.log('Accounts:', accounts.rows.length);
  } catch (err) {
    console.error('Error Details:', err.message);
    if (err.message.includes('column "voided" does not exist')) {
        console.error('CRITICAL: Column "voided" is missing from transactions table.');
    }
  } finally {
      await pool.end();
  }
}

test();
