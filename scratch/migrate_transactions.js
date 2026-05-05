const { Pool } = require('pg');

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Adding performed_by column to transactions ---');
    await pool.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS performed_by TEXT');
    console.log('Column added successfully.');

  } catch (err) {
    console.error('Migration Error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
