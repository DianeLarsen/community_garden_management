import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  const { plot_id, start_date, end_date, user_id, group_id } = await request.json();
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requesterId = decoded.userId;

    if (!requesterId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await pool.connect();

    const reservationQuery = `
      SELECT COUNT(*) 
      FROM plot_history 
      WHERE plot_id = $1 
        AND (
          (reserved_at < $2 AND reserved_until > $2) OR 
          (reserved_at < $3 AND reserved_until > $3) OR 
          (reserved_at >= $2 AND reserved_until <= $3)
        )
    `;

    const reservationResult = await client.query(reservationQuery, [plot_id, start_date, end_date]);
    const isReserved = reservationResult.rows[0].count > 0;

    client.release();

    return NextResponse.json({ isReserved });
  } catch (error) {
    console.error('Error checking plot reservation:', error);
    return NextResponse.json({ error: 'Error checking plot reservation' }, { status: 500 });
  }
}
