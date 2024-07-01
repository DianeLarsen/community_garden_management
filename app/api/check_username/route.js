import { NextResponse } from 'next/server';
import pool from '@/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id FROM users WHERE username = $1', [username]);
    client.release();

    if (result.rows.length > 0) {
      return NextResponse.json({ available: false });
    } else {
      return NextResponse.json({ available: true });
    }
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json({ error: 'Error checking username' }, { status: 500 });
  }
}
