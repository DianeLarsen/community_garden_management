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
    const acceptInviteQuery = `
      UPDATE event_invitations
      SET status = 'accepted'
      WHERE event_id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await client.query(acceptInviteQuery, [id, userId]);

    if (result.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    const registerUserQuery = `
      INSERT INTO event_registrations (event_id, user_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    await client.query(registerUserQuery, [id, userId]);
    client.release();

    return NextResponse.json({ message: 'Invite accepted!', registration: result.rows[0] });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: 'Error accepting invite' }, { status: 500 });
  }
}
