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
    const InvitesQuery = `
SELECT * FROM group_invitations
    `;
    const invitesResult = await client.query(InvitesQuery, [userId]);
    client.release();

    return NextResponse.json(invitesResult.rows);
  } catch (error) {
    console.error('Error fetching user events:', error);
    return NextResponse.json({ error: 'Error fetching user events' }, { status: 500 });
  }
}
