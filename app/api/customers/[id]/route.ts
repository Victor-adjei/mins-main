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
      customer_type,
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
          customer_type = $11,
          next_of_kin = $12,
          next_of_kin_phone = $13
      WHERE customer_number = $14
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
      next_of_kin || null,
      next_of_kin_phone || null,
      id
    ]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Update Customer API Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
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
  } catch (error: any) {
    console.error('Delete Customer API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
