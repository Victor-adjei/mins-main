import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const res = await query('SELECT * FROM customer_type ORDER BY customer_type_name ASC');
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('Customer Types GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { name } = await req.json();
    const res = await query('INSERT INTO customer_type (customer_type_name) VALUES ($1) RETURNING *', [name]);
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Customer Types POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
