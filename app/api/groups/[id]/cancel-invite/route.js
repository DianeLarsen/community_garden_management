import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function POST(request, { params }) {
  const { id } = params; // event

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
    const groupAdminResult = await client.query(groupAdminQuery, [group.group_id]);
    const isGroupAdmin = groupAdminResult.rows.some(row => row.user_id === userId);

    const inviteQuery = `
    SELECT 
      group_invitations.id,
      group_invitations.group_id,
      group_invitations.user_id,
      group_invitations.requester_id,
      group_invitations.status,
      users.username,
      users.email
    FROM 
      group_invitations
    JOIN 
      users ON group_invitations.user_id = users.id
    WHERE 
      group_invitations.user_id = $1 AND group_invitations.group_id = $2
  `;
  

    const inviteResult = await client.query(inviteQuery, [userId, id]);
    
    const invite = inviteResult.rows[0];

    if (!invite) {
      client.release();
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const isRequester = invite.user_id === invite.requester_id;

    if (!isAdmin && !isGroupAdmin && !isRequester) {
      client.release();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const deleteInviteQuery = `
      DELETE FROM group_invitations WHERE id = $1
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
