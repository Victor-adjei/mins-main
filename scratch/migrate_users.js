const { Pool } = require('pg');

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Migrating Users Table ---');
    await pool.query(`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()
    `);
    console.log('Migration successful: phone and created_at columns added.');
  } catch (err) {
    console.error('Migration Failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
