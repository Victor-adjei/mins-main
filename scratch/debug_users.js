const { Pool } = require('pg');

async function debugQuery() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Debugging Users Query ---');
    // Check columns explicitly
    const cols = await pool.query(`
      SELECT column_name, data_type, table_schema
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
    `);
    console.log('Columns in public.users:', cols.rows.map(c => c.column_name).join(', '));

    const res = await pool.query(`
      SELECT * FROM users LIMIT 1
    `);
    console.log('Success! Columns in result:', Object.keys(res.rows[0] || {}).join(', '));

  } catch (err) {
    console.error('Query Failed:', err.message);
  } finally {
    await pool.end();
  }
}

debugQuery();
