import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await pool.connect();
    const eventsQuery = `
      SELECT e.*, 'registered' AS status
      FROM events e
      JOIN event_registrations er ON e.id = er.event_id
      WHERE er.user_id = $1
      UNION
      SELECT e.*, ei.status
      FROM events e
      JOIN event_invitations ei ON e.id = ei.event_id
      WHERE ei.user_id = $1
    `;
    const eventsResult = await client.query(eventsQuery, [userId]);
    client.release();

    return NextResponse.json(eventsResult.rows);
  } catch (error) {
    console.error('Error fetching user events:', error);
    return NextResponse.json({ error: 'Error fetching user events' }, { status: 500 });
  }
}
