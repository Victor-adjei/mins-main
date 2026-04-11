import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

// Update user (Admin only)
export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session || session.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { role, password } = await req.json();

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        'UPDATE users SET role = $1, password = $2 WHERE user_number = $3',
        [role, hashedPassword, id]
      );
    } else {
      await query(
        'UPDATE users SET role = $1 WHERE user_number = $2',
        [role, id]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('User Update Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
};

// Delete user (Admin only)
export const DELETE = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session || session.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await query('DELETE FROM users WHERE user_number = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('User Delete Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
