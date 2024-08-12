import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';
import sendEmail from '@/utils/sendEmail'; // Assume you have an email utility

export async function POST(request, { params }) {
  const { id } = params;
  const { email } = await request.json();
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const role = decoded.role;

    const client = await pool.connect();
    const groupQuery = `
      SELECT * FROM groups WHERE id = $1
    `;
    const groupResult = await client.query(groupQuery, [id]);
    const group = groupResult.rows[0];

    if (!group) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isAdmin = role === 'admin';

    const groupAdminQuery = `
    SELECT user_id FROM group_memberships WHERE group_id = $1 AND role = 'admin'
  `;
  const groupAdminResult = await client.query(groupAdminQuery, [id]);
  const isGroupAdmin = groupAdminResult.rows.some(row => row.user_id === userId);
   

    if (!isAdmin && !isGroupAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if user exists
    const userQuery = `
      SELECT id FROM users WHERE email = $1
    `;
    const userResult = await client.query(userQuery, [email]);
    let inviteUserId;

    if (userResult.rows.length > 0) {
      // User exists
      inviteUserId = userResult.rows[0].id;
    } else {
      // User does not exist, send invite email
      await sendEmail(email, `You have been invited to join the group ${group.name}!`, `Click here to join: ${process.env.NEXT_PUBLIC_BASE_URL}/join/${id}`);
      inviteUserId = null;
    }

    const inviteQuery = `
      INSERT INTO group_invitations (group_id, user_id, requester_id, status)
      VALUES ($1, $2, $3, 'invited')
      RETURNING *
    `;
    await client.query(inviteQuery, [id, inviteUserId, userId]);

    client.release();

    return NextResponse.json({ message: 'User invited' });
  } catch (error) {
    console.error('Error inviting user:', error);
    return NextResponse.json({ error: 'Error inviting user' }, { status: 500 });
  }
}
