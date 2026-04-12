const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.qjmzyymoysdatkotltmo:xsjf3WsWyv3VFGBm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

async function verifyFix() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- Verifying Fix for Account 8321262206 ---');
    
    // 1. Ensure the account exists
    const accCheck = await pool.query('SELECT * FROM accounts WHERE account_number = $1', ['8321262206']);
    if (accCheck.rows.length === 0) {
      console.log('Account 8321262206 not found. Creating a test account...');
      // We need a customer too.
      const custRes = await pool.query('SELECT customer_number FROM customers LIMIT 1');
      if (custRes.rows.length === 0) {
         throw new Error('No customers found to create a test account.');
      }
      const customer_number = custRes.rows[0].customer_number;
      await pool.query(
        'INSERT INTO accounts (account_number, customer, balance, account_type, account_status) VALUES ($1, $2, $3, $4, $5)',
        ['8321262206', customer_number, 100.00, '1', '1']
      );
      console.log('Test account created.');
    }

    // 2. Attempt a transaction that previously failed
    console.log('Attempting to insert a transaction for account 8321262206...');
    const transRes = await pool.query(
      'INSERT INTO transactions (account_number, transaction_type, amount, description) VALUES ($1, $2, $3, $4) RETURNING *',
      ['8321262206', 'Deposit', 50.00, 'Verification deposit for fix']
    );
    
    console.log('Transaction inserted successfully:', transRes.rows[0]);
    console.log('VERIFICATION SUCCESSFUL: The integer overflow issue is resolved.');

  } catch (err) {
    console.error('Verification FAILED:', err);
  } finally {
    await pool.end();
  }
}

verifyFix();
