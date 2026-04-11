const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    console.log("--- RECONFIGURING ACCOUNTS TABLE ---");
    
    // 1. Rename existing 'account_number' to 'account_id'
    // Check if account_id exists first
    const checkId = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'accounts' AND column_name = 'account_id'
    `);
    
    if (checkId.rowCount === 0) {
      console.log("Renaming 'account_number' to 'account_id'...");
      await pool.query('ALTER TABLE accounts RENAME COLUMN account_number TO account_id');
    }

    // 2. Add the NEW 'account_number' column as VARCHAR
    console.log("Adding NEW 'account_number' column...");
    await pool.query(`
      ALTER TABLE accounts 
      ADD COLUMN IF NOT EXISTS account_number VARCHAR(20);
    `);
    
    // 3. Populate existing records with 10-digit numbers
    const res = await pool.query('SELECT account_id FROM accounts WHERE account_number IS NULL');
    console.log(`Populating ${res.rowCount} accounts...`);
    for (const row of res.rows) {
      const randomNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      await pool.query('UPDATE accounts SET account_number = $1 WHERE account_id = $2', [randomNum, row.account_id]);
    }
    
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
