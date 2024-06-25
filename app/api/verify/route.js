import { NextResponse } from 'next/server';
import pool from '@/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  try {
    const client = await pool.connect();

    const result = await client.query(
      'UPDATE users SET verified = $1, verification_token = $2 WHERE verification_token = $3 RETURNING *',
      [true, null, token]
    );

    await client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({ error: 'Error verifying email' }, { status: 500 });
  }
}
