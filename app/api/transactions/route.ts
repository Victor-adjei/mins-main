import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';
import { auth } from '@/auth';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const res = await query(`
      SELECT t.*, c.first_name, c.surname
      FROM transactions t
      JOIN accounts a ON t.account_number = a.account_number
      JOIN customers c ON a.customer = c.customer_number
      WHERE t.voided = false
      ORDER BY t.transaction_date DESC
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const client = await pool.connect();
  
  try {
    const { account_number, transaction_type, amount, description } = await req.json();
    
    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Fetch current balance with row-level lock
    const accountRes = await client.query(
      'SELECT balance FROM accounts WHERE account_number = $1 FOR UPDATE',
      [account_number]
    );

    if (accountRes.rows.length === 0) {
      throw new Error('Account not found');
    }

    const currentBalance = parseFloat(accountRes.rows[0].balance);
    let newBalance = currentBalance;

    if (transaction_type === 'Deposit') {
      newBalance += amount;
    } else if (transaction_type === 'Withdrawal') {
      // Restriction: Field Officers cannot perform withdrawals
      if (req.auth.user.role === 'Field Officer') {
        throw new Error('Access Denied: Field Officers are restricted to Deposits only.');
      }
      
      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }
      newBalance -= amount;
    } else {
      throw new Error('Invalid transaction type');
    }

    // 2. Update account balance
    await client.query(
      'UPDATE accounts SET balance = $1 WHERE account_number = $2',
      [newBalance, account_number]
    );

    // 3. Record transaction
    const transRes = await client.query(
      'INSERT INTO transactions (account_number, transaction_type, amount, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [account_number, transaction_type, amount, description]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      message: 'Transaction successful',
      newBalance,
      transaction: transRes.rows[0]
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Transaction Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
});
