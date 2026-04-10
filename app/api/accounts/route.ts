import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const res = await query(`
      SELECT 
        a.*, 
        c.first_name, c.surname,
        at.account_type_name,
        as_status.account_status_name
      FROM accounts a
      JOIN customers c ON a.customer = c.customer_number
      LEFT JOIN account_type at ON a.account_type = at.account_type_number
      LEFT JOIN account_status as_status ON a.account_status = as_status.account_status_number
      ORDER BY a.created_at DESC
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Accounts GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { customer_id, account_type_id, account_status_id, initial_balance } = await req.json();
    
    // Auto-generate a 10-digit account number
    // We use a high range to ensure 10 digits and minimize collision probability
    const account_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const res = await query(`
      INSERT INTO accounts (account_number, customer, account_type, account_status, balance)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [account_number, customer_id, account_type_id, account_status_id, initial_balance || 0]);
    
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Account Create Error:', error);
    // Handle unique constraint violation if necessary (statistically rare with 10 digits)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
