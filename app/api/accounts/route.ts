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
      whereClause = 'WHERE a.account_number = $1';
      params = [accountNumber];
    }

    const res = await query(`
      SELECT 
        a.*, 
        c.first_name, c.surname, c.customer_type,
        ct.customer_type_name,
        at.account_type_name,
        as_status.account_status_name,
        (SELECT COUNT(*) + 1 FROM accounts a2 WHERE a2.balance > a.balance) as account_rank
      FROM accounts a
      LEFT JOIN customers c ON a.customer = c.customer_number
      LEFT JOIN customer_type ct ON c.customer_type = ct.customer_type_number
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
    const body = await req.json();
    const { 
      customer_id,
      customer_number,
      account_type_id, 
      account_type,
      initial_balance,
      mobile_banker,
      account_number,
      account_status,
      account_status_id
    } = body;

    // Support both naming conventions from different frontend pages
    const final_customer = (customer_id || customer_number)?.toString();
    const final_account_type = (account_type_id || account_type)?.toString();
    const final_account_status = (account_status_id || account_status || "1").toString();
    const final_account_number = (account_number || Math.floor(1000000000 + Math.random() * 9000000000)).toString();

    if (!final_customer) {
      return NextResponse.json({ error: 'Customer is required' }, { status: 400 });
    }
    if (!final_account_type) {
      return NextResponse.json({ error: 'Account type is required' }, { status: 400 });
    }

    const res = await query(`
      INSERT INTO accounts (
        customer, 
        account_type, 
        account_number,
        balance, 
        account_status,
        mobile_banker
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      final_customer, 
      final_account_type, 
      final_account_number, 
      initial_balance || 0, 
      final_account_status, 
      mobile_banker
    ]);
    
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Accounts POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
