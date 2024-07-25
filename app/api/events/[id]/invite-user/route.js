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
    const eventQuery = `
      SELECT user_id, group_id FROM events WHERE id = $1
    `;
    const eventResult = await client.query(eventQuery, [id]);
    const event = eventResult.rows[0];

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isAdmin = role === 'admin';
    const isOrganizer = event.user_id === userId;

    const groupAdminQuery = `
      SELECT user_id FROM group_memberships WHERE group_id = $1 AND role = 'admin'
    `;
    const groupAdminResult = await client.query(groupAdminQuery, [event.group_id]);
    const isGroupAdmin = groupAdminResult.rows.some(row => row.user_id === userId);

    if (!isAdmin && !isOrganizer && !isGroupAdmin) {
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

      // Check if the user is already invited or attending
      const checkInviteQuery = `
        SELECT 1 FROM event_invitations WHERE event_id = $1 AND user_id = $2
      `;
      const checkInviteResult = await client.query(checkInviteQuery, [id, inviteUserId]);

      const checkRegistrationQuery = `
        SELECT 1 FROM event_registrations WHERE event_id = $1 AND user_id = $2
      `;
      const checkRegistrationResult = await client.query(checkRegistrationQuery, [id, inviteUserId]);

      if (checkInviteResult.rows.length > 0 || checkRegistrationResult.rows.length > 0) {
        return NextResponse.json({ error: 'User already invited or attending' }, { status: 400 });
      }
    } else {
      // User does not exist, send invite email
      await sendEmail(email, 'You have been invited to an event', `Click here to join: ${process.env.NEXT_PUBLIC_BASE_URL}/join/${id}`);
      inviteUserId = null;
    }

    const inviteQuery = `
      INSERT INTO event_invitations (event_id, user_id, status)
      VALUES ($1, $2, 'invited')
      RETURNING *
    `;
    await client.query(inviteQuery, [id, inviteUserId]);

    client.release();

    return NextResponse.json({ message: 'User invited' });
  } catch (error) {
    console.error('Error inviting user:', error);
    return NextResponse.json({ error: 'Error inviting user' }, { status: 500 });
  }
}
