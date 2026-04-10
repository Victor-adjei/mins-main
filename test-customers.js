const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testCustomers() {
  try {
    const res = await pool.query(`
      SELECT c.*, ct.customer_type_name
      FROM customers c
      LEFT JOIN customer_type ct ON c.customer_type_number = ct.customer_type_number
      ORDER BY c.registration_date DESC
    `);
    console.log(res.rows.length, 'customers retrieved');
  } catch(e) {
    console.error('CUSTOMERS QUERY ERROR:', e.message);
  } finally {
    pool.end();
  }
}
testCustomers();
