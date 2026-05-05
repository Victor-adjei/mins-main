const { Pool } = require('pg');

async function checkData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Checking Users ---');
    const users = await pool.query('SELECT user_number, username, role FROM users LIMIT 5');
    console.table(users.rows);

    console.log('\n--- Checking Customers and Mobile Banker ---');
    const customers = await pool.query('SELECT customer_number, first_name, surname, mobile_banker FROM customers WHERE mobile_banker IS NOT NULL LIMIT 10');
    console.table(customers.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkData();
