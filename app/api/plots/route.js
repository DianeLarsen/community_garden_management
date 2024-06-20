import { NextResponse } from 'next/server';
import pool from '@/utils/db';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token'); // Assuming you pass the token as a query parameter

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM garden_plots 
       WHERE user_id = $1 OR group_id IN 
       (SELECT group_id FROM group_memberships WHERE user_id = $1)`,
      [userId]
    );

    await client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching plots:', error);
    return NextResponse.json({ error: 'Error fetching plots' }, { status: 500 });
  }
}
