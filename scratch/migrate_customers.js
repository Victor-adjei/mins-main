const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    console.log("--- RECONFIGURING CUSTOMERS TABLE ---");
    
    // 1. Rename existing 'customer_number' to 'customer_id' if not already done
    const checkId = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'customer_id'
    `);
    
    if (checkId.rowCount === 0) {
      console.log("Renaming 'customer_number' to 'customer_id'...");
      await pool.query('ALTER TABLE customers RENAME COLUMN customer_number TO customer_id');
    }

    // 2. Add the NEW 'customer_number' column as VARCHAR
    console.log("Adding NEW 'customer_number' column...");
    await pool.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS customer_number VARCHAR(20);
    `);
    
    // 3. Populate existing records with 8-digit numbers
    const res = await pool.query('SELECT customer_id FROM customers WHERE customer_number IS NULL');
    console.log(`Populating ${res.rowCount} customers...`);
    for (const row of res.rows) {
      const randomNum = Math.floor(10000000 + Math.random() * 90000000).toString();
      await pool.query('UPDATE customers SET customer_number = $1 WHERE customer_id = $2', [randomNum, row.customer_id]);
    }
    
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
