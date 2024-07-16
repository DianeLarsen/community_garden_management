import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function POST(request, { params }) {
  const { id } = params;
  const { inviteId, inviteUserId, inviteUsername } = await request.json();
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

    await client.query('BEGIN');

    // Remove from event_invitations
    const deleteInviteQuery = `
      DELETE FROM event_invitations WHERE id = $1
    `;
    await client.query(deleteInviteQuery, [inviteId]);

    // Add to event_registrations
    const insertRegistrationQuery = `
      INSERT INTO event_registrations (event_id, user_id, status)
      VALUES ($1, $2, 'attending')
    `;
    await client.query(insertRegistrationQuery, [id, inviteUserId]);

    await client.query('COMMIT');
    client.release();

    return NextResponse.json({ message: 'Invite approved and user added to attendees' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error approving invite:', error);
    client.release();
    return NextResponse.json({ error: 'Error approving invite' }, { status: 500 });
  }
}
