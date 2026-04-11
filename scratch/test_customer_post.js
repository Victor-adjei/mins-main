const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

async function testInsert() {
  const queryText = `
    INSERT INTO customers (
      first_name, middle_name, surname, gender, date_of_birth,
      nationality, phone_number, ghana_card_number, 
      mobile_banker, passport_photo, customer_type
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
  
  // Test with dummy data
  const params = [
    'Test', 'M', 'User', 'Male', '1990-01-01',
    'Ghanaian', '0240000000', 'GHA-000000000-0',
    'Banker A', null, '1'
  ];

  try {
    const res = await pool.query(queryText, params);
    console.log("Success:", res.rows[0]);
  } catch (err) {
    console.error("FAILED:", err.message);
    if (err.detail) console.error("DETAIL:", err.detail);
    if (err.hint) console.error("HINT:", err.hint);
  } finally {
    await pool.end();
  }
}

testInsert();
