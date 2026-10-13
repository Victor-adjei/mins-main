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
    const body = await req.json();
    const { username, email, phone, role, password } = body;

    // Fetch existing user to allow full or partial updates
    const userRes = await query('SELECT * FROM users WHERE user_number = $1', [id]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const currentUser = userRes.rows[0];

    const updatedUsername = username !== undefined && username !== null && username.toString().trim() !== '' 
      ? username.toString().trim() 
      : currentUser.username;
    const updatedEmail = email !== undefined && email !== null && email.toString().trim() !== '' 
      ? email.toString().trim() 
      : currentUser.email;
    const updatedPhone = phone !== undefined 
      ? (phone && phone.toString().trim() !== '' ? phone.toString().trim() : null) 
      : currentUser.phone;
    const updatedRole = role !== undefined && role !== null && role.toString().trim() !== '' 
      ? role 
      : currentUser.role;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        `UPDATE users 
         SET username = $1, email = $2, phone = $3, role = $4, password = $5 
         WHERE user_number = $6`,
        [updatedUsername, updatedEmail, updatedPhone, updatedRole, hashedPassword, id]
      );
    } else {
      await query(
        `UPDATE users 
         SET username = $1, email = $2, phone = $3, role = $4 
         WHERE user_number = $5`,
        [updatedUsername, updatedEmail, updatedPhone, updatedRole, id]
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
