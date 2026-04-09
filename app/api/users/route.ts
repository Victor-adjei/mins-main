import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export const GET = auth(async (req) => {
  if (!req.auth || (req.auth.user as any).role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const res = await query('SELECT user_number, username, email, role FROM users ORDER BY username ASC');
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = auth(async (req) => {
  if (!req.auth || (req.auth.user as any).role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { username, password, email, role } = await req.json();
    
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const res = await query(`
      INSERT INTO users (username, password, email, role)
      VALUES ($1, $2, $3, $4)
      RETURNING user_number, username, email, role
    `, [username, hashedPassword, email, role]);

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('User Create Error:', error);
    if (error.code === '23505') {
       return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
