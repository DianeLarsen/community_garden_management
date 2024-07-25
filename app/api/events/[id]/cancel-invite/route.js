import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function POST(request, { params }) {
  const { id } = params; // event
  const { userId } = await request.json();
  const token = request.cookies.get('token')?.value;
console.log(userId)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const userId = decoded.userId;
    const role = decoded.role;

    const client = await pool.connect();
    const eventQuery = `
      SELECT user_id, group_id FROM events WHERE id = $1
    `;
    const eventResult = await client.query(eventQuery, [id]);
    const event = eventResult.rows[0];

    if (!event) {
      client.release();
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isAdmin = role === 'admin';
    const isOrganizer = event.user_id === userId;

    const groupAdminQuery = `
      SELECT user_id FROM group_memberships WHERE group_id = $1 AND role = 'admin'
    `;
    const groupAdminResult = await client.query(groupAdminQuery, [event.group_id]);
    const isGroupAdmin = groupAdminResult.rows.some(row => row.user_id === userId);

    const inviteQuery = `
      SELECT id FROM event_invitations WHERE user_id = $1 AND event_id = $2
    `;
    console.log(inviteQuery)
    const inviteResult = await client.query(inviteQuery, [userId, id]);
    
    const invite = inviteResult.rows[0];

    if (!invite) {
      client.release();
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const isRequester = invite.user_id === invite.requester_id;

    if (!isAdmin && !isOrganizer && !isGroupAdmin && !isRequester) {
      client.release();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const deleteInviteQuery = `
      DELETE FROM event_invitations WHERE id = $1
      RETURNING *
    `;
    const result = await client.query(deleteInviteQuery, [invite.id]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invitation not found or already cancelled' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling invite:', error);
    return NextResponse.json({ error: 'Error cancelling invite' }, { status: 500 });
  }
}
