import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function GET(request) {
  const userId = request.headers.get('x-user-id'); // Assume user ID is sent in request headers

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT role FROM users WHERE id = $1', [userId]);
    await client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = result.rows[0].role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Proceed with the API logic for admin users
    // Example logic: Fetch community garden data
    const gardens = await pool.query('SELECT * FROM community_gardens');
    return NextResponse.json({ gardens: gardens.rows });
  } catch (error) {
    console.error('Error checking user role:', error);
    return NextResponse.json({ error: 'Error checking user role' }, { status: 500 });
  }
}
