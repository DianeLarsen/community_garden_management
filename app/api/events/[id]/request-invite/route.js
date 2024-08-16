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

    const client = await pool.connect();

    // Check if the user is already invited or attending the event
    const checkQuery = `
      SELECT * FROM event_invitations 
      WHERE event_id = $1 AND user_id = $2
      UNION
      SELECT * FROM event_registrations 
      WHERE event_id = $1 AND user_id = $2
    `;
    const checkResult = await client.query(checkQuery, [id, userId]);

    if (checkResult.rows.length > 0) {
      client.release();
      return NextResponse.json({ error: 'User is already invited or attending this event' }, { status: 400 });
    }

    // If not already invited or attending, proceed to insert the new invitation
    const insertQuery = `
      INSERT INTO event_invitations (event_id, user_id, requester_id, status)
      VALUES ($1, $2, $2, 'pending')
      RETURNING *
    `;
    const result = await client.query(insertQuery, [id, userId]);
    client.release();

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error requesting invite:', error);
    return NextResponse.json({ error: 'Error requesting invite' }, { status: 500 });
  }
}
