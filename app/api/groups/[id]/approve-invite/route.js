import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function POST(request, { params }) {
  const { id } = params;
  const { inviteId, inviteUserId } = await request.json();
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
      client.release();
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const isAdmin = role === 'admin';


    const groupAdminQuery = `
      SELECT user_id FROM group_memberships WHERE group_id = $1 AND role = 'admin'
    `;
    const groupAdminResult = await client.query(groupAdminQuery, [id]);
    const isGroupAdmin = groupAdminResult.rows.some(row => row.user_id === userId);
 console.log(groupAdminResult.rows)
    if (!isAdmin && !isGroupAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await client.query('BEGIN');


    // Remove from event_invitations
    const deleteInviteQuery = `
      DELETE FROM group_invitations WHERE id = $1
    `;
    await client.query(deleteInviteQuery, [inviteId]);
    console.log("made it here1")
    // Add to event_registrations
    const insertRegistrationQuery = `
      INSERT INTO group_memberships (group_id, user_id)
      VALUES ($1, $2)
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
