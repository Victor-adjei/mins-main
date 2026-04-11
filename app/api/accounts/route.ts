import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const GET = async (req: Request) => {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accountNumber = searchParams.get('accountNumber');

  try {
    let whereClause = '';
    let params: any[] = [];

    if (accountNumber) {
      whereClause = 'WHERE a.account_number::text = $1';
      params = [accountNumber];
    }

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
      ${whereClause}
      ORDER BY a.created_at DESC
    `, params);
    
    // Ensure we always return an array
    const rows = Array.isArray(res.rows) ? res.rows : [];
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Accounts GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
};

export const POST = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { 
      customer_number,
      account_type, 
      initial_balance,
      mobile_banker,
      account_number
    } = await req.json();

    const res = await query(`
      INSERT INTO accounts (
        customer, 
        account_type, 
        account_number,
        balance, 
        account_status,
        mobile_banker
      )
      VALUES ($1, $2, $3, $4, 1, $5)
      RETURNING *
    `, [customer_number, account_type, account_number, initial_balance || 0, mobile_banker]);
    
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Accounts POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
