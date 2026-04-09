const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function fixIndex() {
  console.log('--- Database Index Fix ---');

  // Load .env.local manually
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local not found');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const databaseUrlMatch = envContent.match(/DATABASE_URL=(.*)/);
  if (!databaseUrlMatch) {
    console.error('Error: DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const databaseUrl = databaseUrlMatch[1].trim();

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await pool.query('SELECT 1'); // Test connection

    console.log('Creating index on users(username)...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);');
    console.log('Index created successfully.');

    // Also check for other users table indexes
    const res = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'users';
    `);
    console.log('Current indexes on users table:');
    res.rows.forEach(r => console.log(` - ${r.indexname}: ${r.indexdef}`));

  } catch (err) {
    console.error('Fix Error:', err);
  } finally {
    await pool.end();
  }
}

fixIndex();
