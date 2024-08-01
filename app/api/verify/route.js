import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const client = await pool.connect();

    // Check if the user is already verified
    const result = await client.query(
      'SELECT verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      client.release();
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const user = result.rows[0];

    if (user.verified) {
      client.release();
      return NextResponse.redirect(new URL(`/verify?status=already_verified`, request.url));
    }

    // Update the user to set verified to true
    const updateResult = await client.query(
      'UPDATE users SET verified = $1, verification_token = $2 WHERE email = $3 RETURNING *',
      [true, null, email]
    );

    client.release();

    return NextResponse.redirect(new URL(`/verify?status=success&email=${updateResult.rows[0].email}`, request.url));
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({ error: 'Error verifying email' }, { status: 500 });
  }
}
