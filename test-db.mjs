import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const query = `
    SELECT 
      t.transaction_id,
      t.amount,
      t.transaction_type,
      a.balance as real_acc_balance,
      (a.balance - COALESCE(
        SUM(CASE WHEN t.transaction_type = 'Deposit' THEN t.amount ELSE -t.amount END) 
          OVER (
            PARTITION BY t.account_number 
            ORDER BY t.transaction_date DESC, t.transaction_id DESC 
            ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
          ), 0
      )) as calculated_balance
    FROM transactions t
    JOIN accounts a ON t.account_number = a.account_number
    WHERE t.voided = false AND t.account_number = '7330629559'
    ORDER BY t.transaction_date DESC, t.transaction_id DESC
    LIMIT 10;
  `;
  try {
    const res = await pool.query(query);
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
