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

interface IdempotencyRecord {
  timestamp: number;
  response: any;
}

const idempotencyStore = new Map<string, IdempotencyRecord>();

function getCachedResponse(key: string): any | null {
  const record = idempotencyStore.get(key);
  if (!record) return null;
  if (Date.now() - record.timestamp > 60000) {
    idempotencyStore.delete(key);
    return null;
  }
  return record.response;
}

function setCachedResponse(key: string, response: any): void {
  const now = Date.now();
  if (idempotencyStore.size > 500) {
    for (const [k, v] of idempotencyStore.entries()) {
      if (now - v.timestamp > 60000) idempotencyStore.delete(k);
    }
  }
  idempotencyStore.set(key, { timestamp: now, response });
}

export const POST = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const client = await pool.connect();
  
  try {
    const { account_number, transaction_type, amount, description, idempotency_key } = await req.json();
    
    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 1. Idempotency Check: Return cached response if this request key was already processed
    if (idempotency_key) {
      const cached = getCachedResponse(idempotency_key);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    await client.query('BEGIN');

    // 2. Race condition & double-submit guard: block duplicate identical transaction within 10 seconds
    const duplicateCheck = await client.query(
      `SELECT transaction_id FROM transactions 
       WHERE account_number = $1 
         AND transaction_type = $2 
         AND amount = $3 
         AND transaction_date > NOW() - INTERVAL '10 seconds'
         AND voided = false
       LIMIT 1`,
      [account_number, transaction_type, amount]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new Error('An identical transaction was just processed seconds ago. Please wait before submitting again to prevent duplicate charges.');
    }

    // 3. Fetch current balance with row-level lock
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

    // 4. Update account balance
    await client.query(
      'UPDATE accounts SET balance = $1 WHERE account_number = $2',
      [newBalance, account_number]
    );

    // 5. Record transaction
    const transRes = await client.query(
      'INSERT INTO transactions (account_number, transaction_type, amount, description, performed_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [account_number, transaction_type, amount, description, req.auth?.user?.name || 'Unknown']
    );

    await client.query('COMMIT');

    // 6. Send SMS Notification asynchronously (GSM-7 clean — single 160-char SMS, no splitting)
    const { phone_number, first_name } = accountRes.rows[0];
    if (phone_number) {
      const senderId = process.env.SASUSYNC_SENDER_ID || 'EYE ADOM';
      const action = transaction_type === 'Deposit' ? 'deposited into' : 'withdrawn from';
      const formattedAmount = Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedBalance = Number(newBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const smsMessage = `EYE ADOM: Hello ${first_name || 'Customer'}, GHS ${formattedAmount} has been ${action} your account ${account_number}. Current Balance: GHS ${formattedBalance}.`;
      
      sendSms(senderId, phone_number, smsMessage).catch(err => {
        console.error('SMS sending failed:', err);
      });
    }

    const responsePayload = {
      message: 'Transaction successful',
      newBalance,
      transaction: transRes.rows[0]
    };

    if (idempotency_key) {
      setCachedResponse(idempotency_key, responsePayload);
    }

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Transaction Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
});
