import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const GET = auth(async (req, { params }) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params as { id: string };

  try {
    const res = await query('SELECT * FROM customers WHERE customer_number::VARCHAR = $1::VARCHAR', [id]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Single Customer API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
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
      middle_name,
      surname, 
      gender, 
      date_of_birth,
      nationality,
      phone_number, 
      ghana_card_number, 
      mobile_banker, 
      passport_photo,
      customer_type
    } = body;

    const res = await query(`
      UPDATE customers 
      SET first_name = $1, 
          middle_name = $2,
          surname = $3, 
          gender = $4, 
          date_of_birth = $5,
          nationality = $6,
          phone_number = $7, 
          ghana_card_number = $8, 
          mobile_banker = $9, 
          passport_photo = $10,
          customer_type = $11
      WHERE customer_number::VARCHAR = $12::VARCHAR
      RETURNING *
    `, [
      first_name, middle_name, surname, gender, date_of_birth,
      nationality, phone_number, ghana_card_number, 
      mobile_banker, passport_photo, customer_type, id
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
    const res = await query('DELETE FROM customers WHERE customer_number::VARCHAR = $1::VARCHAR RETURNING *', [id]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Delete Customer API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
