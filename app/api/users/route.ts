import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

// GET all users (Admin only)
export const GET = async (req: Request) => {
  const session = await auth();
  if (!session || session.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await query(`
      SELECT user_number, username, email, role, phone, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Users API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

// POST create user (Admin only)
export const POST = async (req: Request) => {
  const session = await auth();
  if (!session || session.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, password, email, role, phone } = await req.json();
    
    if (!username || !password || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await (await import('bcryptjs')).default.hash(password, 10);

    const res = await query(`
      INSERT INTO users (username, password, email, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_number, username, email, role, phone, created_at
    `, [username, hashedPassword, email, role, phone]);
    
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('User Create Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
