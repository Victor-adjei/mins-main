const { Pool } = require('pg');

async function backfill() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Backfilling performed_by column ---');
    const res = await pool.query(`
      UPDATE transactions t
      SET performed_by = c.mobile_banker
      FROM accounts a
      JOIN customers c ON a.customer = c.customer_number
      WHERE t.account_number = a.account_number
      AND t.performed_by IS NULL
    `);
    console.log(`Successfully backfilled ${res.rowCount} transactions.`);

  } catch (err) {
    console.error('Backfill Error:', err);
  } finally {
    await pool.end();
  }
}

backfill();
