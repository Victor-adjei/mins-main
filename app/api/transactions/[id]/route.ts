import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';
import { auth } from '@/auth';

// 12 hours in milliseconds
const VOID_WINDOW_MS = 12 * 60 * 60 * 1000;

export const DELETE = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  const { reason } = await req.json();

  if (!reason) {
    return NextResponse.json({ error: 'Cancellation reason is required' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch transaction
    const transRes = await client.query('SELECT * FROM transactions WHERE transaction_id = $1', [id]);
    if (transRes.rows.length === 0) {
      throw new Error('Transaction not found');
    }
    const trans = transRes.rows[0];

    if (trans.voided) {
      throw new Error('Transaction is already voided');
    }

    // 2. Window Check for Field Officers
    const isFieldOfficer = req.auth.user.role === 'Field Officer';
    if (isFieldOfficer) {
      const createdTime = new Date(trans.transaction_date).getTime();
      const now = new Date().getTime();
      if (now - createdTime > VOID_WINDOW_MS) {
        throw new Error('Transaction cannot be voided after 12 hours.');
      }
      
      // Note: We don't have a 'created_by' column in transactions yet, 
      // but usually the officer who created it is the one doing it.
      // If we need stricter ownership, we'd need to add 'created_by' to transactions.
    }

    // 3. Fetch account balance with lock
    const accountRes = await client.query(
      'SELECT balance FROM accounts WHERE account_number = $1 FOR UPDATE',
      [trans.account_number]
    );
    if (accountRes.rows.length === 0) {
      throw new Error('Account not found');
    }

    const currentBalance = parseFloat(accountRes.rows[0].balance);
    const amount = parseFloat(trans.amount);
    let newBalance = currentBalance;

    // 4. Reverse Balance
    if (trans.transaction_type === 'Deposit') {
      newBalance = Math.max(0, currentBalance - amount);
    } else if (trans.transaction_type === 'Withdrawal') {
      newBalance = currentBalance + amount;
    }

    // 5. Update Account
    await client.query('UPDATE accounts SET balance = $1 WHERE account_number = $2', [newBalance, trans.account_number]);

    // 6. Void Transaction
    await client.query(
      'UPDATE transactions SET voided = TRUE, void_reason = $1, voided_at = NOW() WHERE transaction_id = $2',
      [reason, id]
    );

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Transaction voided successfully', newBalance });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Void Transaction Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
});

export const PUT = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  const { amount: newAmount, description } = await req.json();

  if (newAmount === undefined || newAmount <= 0) {
    return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch transaction
    const transRes = await client.query('SELECT * FROM transactions WHERE transaction_id = $1', [id]);
    if (transRes.rows.length === 0) {
      throw new Error('Transaction not found');
    }
    const trans = transRes.rows[0];

    if (trans.voided) {
      throw new Error('Cannot edit a voided transaction');
    }

    // 2. Window Check for Field Officers
    const isFieldOfficer = req.auth.user.role === 'Field Officer';
    if (isFieldOfficer) {
      const createdTime = new Date(trans.transaction_date).getTime();
      const now = new Date().getTime();
      if (now - createdTime > VOID_WINDOW_MS) {
        throw new Error('Transaction cannot be edited after 12 hours.');
      }
    }

    // 3. Calculate Delta and New Balance
    const oldAmount = parseFloat(trans.amount);
    const diff = newAmount - oldAmount;
    
    const accountRes = await client.query(
      'SELECT balance FROM accounts WHERE account_number = $1 FOR UPDATE',
      [trans.account_number]
    );
    if (accountRes.rows.length === 0) {
      throw new Error('Account not found');
    }

    const currentBalance = parseFloat(accountRes.rows[0].balance);
    let newBalance = currentBalance;

    if (trans.transaction_type === 'Deposit') {
      newBalance = Math.max(0, currentBalance + diff);
    } else if (trans.transaction_type === 'Withdrawal') {
      newBalance = Math.max(0, currentBalance - diff);
    }

    // 4. Update Account
    await client.query('UPDATE accounts SET balance = $1 WHERE account_number = $2', [newBalance, trans.account_number]);

    // 5. Update Transaction
    await client.query(
      'UPDATE transactions SET amount = $1, description = $2 WHERE transaction_id = $3',
      [newAmount, description, id]
    );

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Transaction updated successfully', newBalance });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Edit Transaction Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
});
