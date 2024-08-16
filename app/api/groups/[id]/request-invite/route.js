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

    // Check if the user is already invited or is a member of the group
    const checkQuery = `
      SELECT 1 FROM group_invitations WHERE group_id = $1 AND user_id = $2
      UNION
      SELECT 1 FROM group_memberships WHERE group_id = $1 AND user_id = $2
    `;
    const checkResult = await client.query(checkQuery, [id, userId]);

    if (checkResult.rows.length > 0) {
      client.release();
      return NextResponse.json({ message: 'Already invited or a member' }, { status: 400 });
    }

    // Insert new invitation if not already invited or a member
    const insertQuery = `
      INSERT INTO group_invitations (group_id, user_id, requester_id, status)
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
