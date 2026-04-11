import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const PUT = auth(async (req, { params }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const { id } = await params as { id: string };
    const { name } = await req.json();
    
    const res = await query(
      'UPDATE customer_type SET customer_type_name = $1 WHERE customer_type_number = $2 RETURNING *',
      [name, id]
    );
    
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Customer type not found' }, { status: 404 });
    }
    
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Customer Type Action Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});

export const DELETE = auth(async (req, { params }) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const { id } = await params as { id: string };
    
    const res = await query(
      'DELETE FROM customer_type WHERE customer_type_number = $1 RETURNING *',
      [id]
    );
    
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Customer type not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Customer Type Action Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
