const { Pool } = require('pg');

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Migrating Accounts Table ---');
    await pool.query(`
      ALTER TABLE public.accounts 
      ADD COLUMN IF NOT EXISTS mobile_banker TEXT
    `);
    console.log('Migration successful: mobile_banker column added to accounts.');
  } catch (err) {
    console.error('Migration Failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();

