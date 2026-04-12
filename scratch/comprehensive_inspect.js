const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

async function fullInspection() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Comprehensive Column Type Inspection ---');
    
    // Check all tables and columns for anything that might be an account number or related ID
    const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE (column_name LIKE '%account%' OR column_name LIKE '%id%' OR column_name LIKE '%number%')
      AND table_schema = 'public'
      ORDER BY table_name, column_name;
    `);
    
    console.table(res.rows);

  } catch (err) {
    console.error('Inspection Error:', err);
  } finally {
    await pool.end();
  }
}

fullInspection();
