import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function POST(request, { params }) {
  const { id } = params;
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { new_end_date } = await request.json();

    const client = await pool.connect();

    const checkConflictQuery = `
      SELECT * FROM plot_history
      WHERE plot_id = $1 AND reserved_at < $2 AND reserved_until > $2
    `;
    const conflictResult = await client.query(checkConflictQuery, [id, new_end_date]);

    if (conflictResult.rows.length > 0) {
      client.release();
      return NextResponse.json({ error: 'Plot is already reserved for the requested extension period' }, { status: 400 });
    }

    const renewQuery = `
      UPDATE plot_history
      SET reserved_until = $1
      WHERE plot_id = $2 AND user_id = $3 AND reserved_until > NOW()
      RETURNING *
    `;
    const renewResult = await client.query(renewQuery, [new_end_date, id, userId]);

    client.release();

    if (renewResult.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to renew plot reservation' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Plot reservation renewed successfully', plot: renewResult.rows[0] });
  } catch (error) {
    console.error('Error renewing plot reservation:', error);
    return NextResponse.json({ error: 'Error renewing plot reservation' }, { status: 500 });
  }
}
