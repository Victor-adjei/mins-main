import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const loan_id = searchParams.get('loan_id');
    
    let sql = 'SELECT * FROM loan_repayments';
    const params: any[] = [];
    
    if (loan_id) {
      sql += ' WHERE loan_id = $1';
      params.push(loan_id);
    }
    
    sql += ' ORDER BY repayment_date DESC';
    
    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Loan Repayments GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { loan_id, amount_paid } = await req.json();
    
    const res = await query(`
      INSERT INTO loan_repayments (loan_id, amount_paid)
      VALUES ($1, $2)
      RETURNING *
    `, [loan_id, amount_paid]);
    
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Loan Repayment POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
