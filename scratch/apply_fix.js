const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

async function fixSchema() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Applying FINAL Comprehensive Schema Fixes ---');
    
    // 1. Drop all potentially conflicting constraints
    console.log('Step 1: Dropping constraints...');
    const dropQueries = [
      'ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_account_number_fkey',
      'ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_customer_number_fkey',
      'ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_account_type_fkey',
      'ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_account_status_fkey',
      'ALTER TABLE accounts DROP CONSTRAINT IF EXISTS unique_account_number'
    ];
    for (const q of dropQueries) {
      await pool.query(q + ';');
    }

    // 2. Fix the account_number uniqueness
    console.log('Step 2: Adding UNIQUE constraint to accounts(account_number)...');
    await pool.query('ALTER TABLE accounts ADD CONSTRAINT unique_account_number UNIQUE (account_number);');

    // 3. Standardize types (Parent and Child columns)
    console.log('Step 3: Altering column types to VARCHAR(255)...');
    const alterQueries = [
      'ALTER TABLE transactions ALTER COLUMN account_number TYPE VARCHAR(255)',
      'ALTER TABLE loans ALTER COLUMN customer_number TYPE VARCHAR(255)',
      'ALTER TABLE users ALTER COLUMN user_number TYPE VARCHAR(255)',
      'ALTER TABLE accounts ALTER COLUMN account_type TYPE VARCHAR(255)',
      'ALTER TABLE accounts ALTER COLUMN account_status TYPE VARCHAR(255)',
      'ALTER TABLE account_status ALTER COLUMN account_status_number TYPE VARCHAR(255)',
      'ALTER TABLE account_type ALTER COLUMN account_type_number TYPE VARCHAR(255)',
      'ALTER TABLE customer_type ALTER COLUMN customer_type_number TYPE VARCHAR(255)'
    ];
    for (const q of alterQueries) {
      await pool.query(q + ';');
    }

    // 4. Re-establish foreign keys with new types
    console.log('Step 4: Recreating foreign keys...');
    const recreateQueries = [
      'ALTER TABLE transactions ADD CONSTRAINT transactions_account_number_fkey FOREIGN KEY (account_number) REFERENCES accounts(account_number) ON DELETE CASCADE',
      'ALTER TABLE loans ADD CONSTRAINT loans_customer_number_fkey FOREIGN KEY (customer_number) REFERENCES customers(customer_number) ON DELETE CASCADE',
      'ALTER TABLE accounts ADD CONSTRAINT accounts_account_type_fkey FOREIGN KEY (account_type) REFERENCES account_type(account_type_number)',
      'ALTER TABLE accounts ADD CONSTRAINT accounts_account_status_fkey FOREIGN KEY (account_status) REFERENCES account_status(account_status_number)'
    ];
    for (const q of recreateQueries) {
      await pool.query(q + ';');
    }

    console.log('FINAL Schema fixes applied successfully.');

  } catch (err) {
    console.error('Migration Error:', err);
  } finally {
    await pool.end();
  }
}

fixSchema();
