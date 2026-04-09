import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const GET = auth(async (req, { params }) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params as { id: string };

  try {
    const res = await query('SELECT * FROM customers WHERE customer_number = $1', [id]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Single Customer API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const PUT = auth(async (req, { params }) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params as { id: string };

  try {
    const body = await req.json();
    const { 
      first_name, 
      surname, 
      gender, 
      phone_number, 
      ghana_card_number, 
      mobile_banker, 
      passport_photo 
    } = body;

    const res = await query(`
      UPDATE customers 
      SET first_name = $1, surname = $2, gender = $3, 
          phone_number = $4, ghana_card_number = $5, 
          mobile_banker = $6, passport_photo = $7
      WHERE customer_number = $8
      RETURNING *
    `, [
      first_name, surname, gender, phone_number, 
      ghana_card_number, mobile_banker, passport_photo, id
    ]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Update Customer API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const DELETE = auth(async (req, { params }) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params as { id: string };

  try {
    const res = await query('DELETE FROM customers WHERE customer_number = $1 RETURNING *', [id]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete Customer API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
