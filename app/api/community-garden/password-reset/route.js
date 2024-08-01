import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '@/db';

export async function POST(request) {
  const { token, password } = await request.json();

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const userId = decoded.userId;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();

    // Update the user's password
    const updateQuery = 'UPDATE users SET password = $1 WHERE id = $2';
    await client.query(updateQuery, [hashedPassword, userId]);

    client.release();

    return NextResponse.json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}
