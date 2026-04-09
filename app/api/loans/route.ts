import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const res = await query(`
      SELECT 
        l.*, 
        c.first_name, c.surname,
        lt.loan_type_name, lt.interest_rate
      FROM loans l
      JOIN customers c ON l.customer_number = c.customer_number
      LEFT JOIN loan_types lt ON l.loan_type_id = lt.loan_type_id
      ORDER BY l.application_date DESC
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { 
      customer_number, 
      loan_type_id, 
      loan_amount, 
      duration_months 
    } = await req.json();

    // Fetch interest rate for calculation
    const ltRes = await query('SELECT interest_rate FROM loan_types WHERE loan_type_id = $1', [loan_type_id]);
    if (ltRes.rows.length === 0) throw new Error('Loan type not found');
    
    const rate = parseFloat(ltRes.rows[0].interest_rate);
    const payable_amount = loan_amount + (loan_amount * (rate / 100));

    const res = await query(`
      INSERT INTO loans (customer_number, loan_type_id, loan_amount, payable_amount, duration_months)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [customer_number, loan_type_id, loan_amount, payable_amount, duration_months]);

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Loan Create Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
