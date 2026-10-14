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
      customer_number,
      next_of_kin,
      next_of_kin_phone
    } = body;

    // Sanitize date_of_birth: empty strings or invalid dates must be null for PostgreSQL DATE column
    let sanitizedDob: string | null = null;
    if (date_of_birth && typeof date_of_birth === 'string' && date_of_birth.trim() !== '') {
      try {
        const parsed = new Date(date_of_birth);
        if (!isNaN(parsed.getTime())) {
          sanitizedDob = parsed.toISOString().split('T')[0];
        }
      } catch {
        sanitizedDob = null;
      }
    }

    // Validate mandatory phone number (must be exactly 10 digits)
    const cleanPhone = typeof phone_number === 'string' ? phone_number.trim() : '';
    if (!cleanPhone || !/^\d{10}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Phone number must be exactly 10 digits' },
        { status: 400 }
      );
    }

    const res = await query(`
      INSERT INTO customers (
        first_name, middle_name, surname, gender, date_of_birth,
        nationality, phone_number, ghana_card_number, 
        mobile_banker, passport_photo, customer_type, customer_number,
        next_of_kin, next_of_kin_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      first_name || null,
      middle_name || null,
      surname || null,
      gender || null,
      sanitizedDob,
      nationality || null,
      cleanPhone,
      ghana_card_number || null,
      mobile_banker || null,
      passport_photo || null,
      customer_type ? customer_type.toString() : null,
      customer_number || Math.floor(10000000 + Math.random() * 90000000).toString(),
      next_of_kin || null,
      next_of_kin_phone || null
    ]);

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Create Customer API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
