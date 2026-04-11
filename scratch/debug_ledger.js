const { query } = require('./lib/db');

async function test() {
  const startDate = '2020-01-01';
  const endDate = '2030-01-01';
  try {
    const res = await query(`
      SELECT t.*, c.first_name, c.surname
      FROM transactions t
      JOIN accounts a ON t.account_number = a.account_number
      JOIN customers c ON a.customer = c.customer_number
      WHERE t.transaction_date::DATE BETWEEN $1 AND $2
      ORDER BY t.transaction_date DESC
    `, [startDate, endDate]);
    console.log('Results count:', res.rows.length);
    if (res.rows.length > 0) {
      console.log('First row example:', res.rows[0]);
    }
  } catch (err) {
    console.error('DB Error:', err);
  }
}

test();
