const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    console.log("--- RECONFIGURING ACCOUNTS FK ---");
    
    // 1. Drop existing FK constraint
    console.log("Dropping old foreign key...");
    await pool.query('ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_customer_fkey');
    
    // 2. Change 'customer' column type to VARCHAR
    console.log("Altering 'customer' column to VARCHAR...");
    await pool.query('ALTER TABLE accounts ALTER COLUMN customer TYPE VARCHAR(20)');
    
    // 3. Update 'accounts.customer' values to match 'customers.customer_number'
    console.log("Updating account links to professional IDs...");
    const res = await pool.query(`
      UPDATE accounts a
      SET customer = c.customer_number
      FROM customers c
      WHERE a.customer::integer = c.customer_id
    `);
    console.log(`Updated ${res.rowCount} account links.`);
    
    // 4. Add NEW foreign key constraint
    console.log("Adding NEW foreign key to customers.customer_number...");
    // First, ensure customers.customer_number has a unique constraint (required for FK)
    await pool.query('ALTER TABLE customers ADD CONSTRAINT unique_customer_number UNIQUE (customer_number)');
    
    await pool.query(`
      ALTER TABLE accounts 
      ADD CONSTRAINT accounts_customer_number_fkey 
      FOREIGN KEY (customer) 
      REFERENCES customers(customer_number)
    `);
    
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
