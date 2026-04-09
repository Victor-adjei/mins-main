import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

// GET all customers
export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await query(`
      SELECT c.*, ct.customer_type_name
      FROM customers c
      LEFT JOIN customers_type ct ON c.customer_type_number = ct.customer_type_number
      ORDER BY c.registration_date DESC
    `);
    
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Customers API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
      surname, 
      gender, 
      phone_number, 
      ghana_card_number, 
      mobile_banker, 
      passport_photo 
    } = body;

    const res = await query(`
      INSERT INTO customers (
        first_name, surname, gender, phone_number, 
        ghana_card_number, mobile_banker, passport_photo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      first_name, surname, gender, phone_number, 
      ghana_card_number, mobile_banker, passport_photo
    ]);

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Create Customer API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
