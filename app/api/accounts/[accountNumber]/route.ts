import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

// GET a specific account
export const GET = auth(async (req, { params }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { accountNumber } = params;

  try {
    const res = await query(`
      SELECT 
        a.*, 
        c.first_name, c.surname, c.customer_type,
        ct.customer_type_name,
        at.account_type_name,
        as_status.account_status_name
      FROM accounts a
      JOIN customers c ON a.customer = c.customer_number
      LEFT JOIN customer_type ct ON c.customer_type::VARCHAR = ct.customer_type_number::VARCHAR
      LEFT JOIN account_type at ON a.account_type = at.account_type_number
      LEFT JOIN account_status as_status ON a.account_status = as_status.account_status_number
      WHERE a.account_number::text = $1
    `, [accountNumber]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Account GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});

// DELETE an account
export const DELETE = auth(async (req, { params }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { accountNumber } = params;

  try {
    // Check if account has transactions (optional but recommended for safety)
    const txCheck = await query('SELECT count(*) FROM transactions WHERE account_number::text = $1', [accountNumber]);
    if (parseInt(txCheck.rows[0].count) > 0) {
      return NextResponse.json({ error: 'Cannot delete account with existing transactions' }, { status: 400 });
    }

    const res = await query('DELETE FROM accounts WHERE account_number::text = $1 RETURNING *', [accountNumber]);
    
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Account DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});

// PUT (Update) an account
export const PUT = auth(async (req, { params }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { accountNumber } = params;
  const body = await req.json();
  const { account_type, initial_balance, mobile_banker, account_status } = body;

  try {
    const res = await query(`
      UPDATE accounts 
      SET 
        account_type = COALESCE($1, account_type),
        balance = COALESCE($2, balance),
        mobile_banker = COALESCE($3, mobile_banker),
        account_status = COALESCE($4, account_status)
      WHERE account_number::text = $5
      RETURNING *
    `, [account_type, initial_balance, mobile_banker, account_status, accountNumber]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Account PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
