import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function GET(request, { params }) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  try {
    const client = await pool.connect();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const result = await client.query(`SELECT id, email, role, verified FROM users WHERE id = $1`, [userId]);
    console.log(result)
    client.release();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}