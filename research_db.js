const { Pool } = require('pg');

async function research() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Database Research ---');
    
    // Check if index exists on username
    const indexRes = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'users' AND indexdef LIKE '%username%';
    `);
    
    if (indexRes.rows.length === 0) {
      console.log('No index found on users(username). Adding one now...');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);');
      console.log('Index created successfully.');
    } else {
      console.log('Index already exists on users(username):', indexRes.rows[0].indexname);
    }

    // Check table size
    const sizeRes = await pool.query("SELECT count(*) FROM users;");
    console.log('Total users in DB:', sizeRes.rows[0].count);

  } catch (err) {
    console.error('Research Error:', err);
  } finally {
    await pool.end();
  }
}

research();
