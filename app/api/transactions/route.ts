import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';
import { auth } from '@/auth';
import { sendSms } from '@/lib/sms';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const res = await query(`
      SELECT 
        t.*, 
        c.first_name, 
        c.surname, 
        (a.balance - COALESCE(
          SUM(CASE WHEN t.transaction_type = 'Deposit' THEN t.amount ELSE -t.amount END) 
            OVER (
              PARTITION BY t.account_number 
              ORDER BY t.transaction_date DESC, t.transaction_id DESC 
              ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
            ), 0
        )) as current_balance
      FROM transactions t
      JOIN accounts a ON t.account_number = a.account_number
      JOIN customers c ON a.customer = c.customer_number
      WHERE t.voided = false
      ORDER BY t.transaction_date DESC, t.transaction_id DESC
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
      `SELECT a.balance, ast.account_status_name, c.phone_number, c.first_name 
       FROM accounts a 
       LEFT JOIN account_status ast ON a.account_status::VARCHAR = ast.account_status_number::VARCHAR 
       LEFT JOIN customers c ON a.customer = c.customer_number
       WHERE a.account_number = $1 FOR UPDATE OF a`,
      [account_number]
    );

    if (accountRes.rows.length === 0) {
      throw new Error('Account not found');
    }

    const accountStatus = accountRes.rows[0].account_status_name;
    if (accountStatus !== 'Active') {
      throw new Error(`Cannot process transaction: Account is ${accountStatus || 'Inactive'}`);
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
      'INSERT INTO transactions (account_number, transaction_type, amount, description, performed_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [account_number, transaction_type, amount, description, req.auth?.user?.name || 'Unknown']
    );

    await client.query('COMMIT');

    // Send SMS Notification asynchronously
    const { phone_number, first_name } = accountRes.rows[0];
    if (phone_number) {
      const senderId = process.env.SASUSYNC_SENDER_ID || 'MIMS';
      const action = transaction_type === 'Deposit' ? 'deposited into' : 'withdrawn from';
      const smsMessage = `Hello ${first_name || 'Customer'}, GHS ${amount} has been ${action} your account ${account_number}. Current Balance: GHS ${newBalance}.`;
      
      sendSms(senderId, phone_number, smsMessage).catch(err => {
        console.error('SMS sending failed:', err);
      });
    }

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
