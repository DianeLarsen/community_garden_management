import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function POST(request, { params }) {
  const { id } = params; // event id
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await pool.connect();
    const leaveEventQuery = `
      DELETE FROM event_registrations
      WHERE event_id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await client.query(leaveEventQuery, [id, userId]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not registered for event or already left' }, { status: 404 });
    }

    return NextResponse.json({ message: 'You have left the event.' });
  } catch (error) {
    console.error('Error leaving event:', error);
    return NextResponse.json({ error: 'Error leaving event' }, { status: 500 });
  }
}
