const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

async function inspectConstraints() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Inspecting Constraints ---');
    
    const res = await pool.query(`
      SELECT
          conname AS constraint_name,
          pg_get_constraintdef(c.oid) AS constraint_definition
      FROM
          pg_constraint c
      JOIN
          pg_namespace n ON n.oid = c.connamespace
      WHERE
          n.nspname = 'public'
          AND conrelid::regclass::text IN ('transactions', 'accounts', 'loans', 'customers');
    `);
    
    console.table(res.rows);

  } catch (err) {
    console.error('Inspection Error:', err);
  } finally {
    await pool.end();
  }
}

inspectConstraints();
