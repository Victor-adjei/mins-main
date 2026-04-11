import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// GET all customers
export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await query(`
      SELECT c.*, ct.customer_type_name
      FROM customers c
      LEFT JOIN customer_type ct ON c.customer_type::VARCHAR = ct.customer_type_number::VARCHAR
      ORDER BY c.registration_date DESC
    `);
    
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('Customers API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});

// POST create customer
export const POST = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
      customer_type,
      customer_number
    } = body;

    const res = await query(`
      INSERT INTO customers (
        first_name, middle_name, surname, gender, date_of_birth,
        nationality, phone_number, ghana_card_number, 
        mobile_banker, passport_photo, customer_type, customer_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      first_name || null,
      middle_name || null,
      surname || null,
      gender || null,
      date_of_birth || null,
      nationality || null,
      phone_number || null,
      ghana_card_number || null,
      mobile_banker || null,
      passport_photo || null,
      customer_type || null,
      customer_number || Math.floor(10000000 + Math.random() * 90000000).toString()
    ]);

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Create Customer API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
