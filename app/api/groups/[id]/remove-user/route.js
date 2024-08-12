import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function DELETE(request, { params }) {
    const { id } = params; // event id
    const { memberId } = await request.json();

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

      const memberQuery = `
      SELECT * FROM users WHERE id = $1
    `;
    const memberResult = await client.query(memberQuery, [memberId]);
    const memberInfo = memberResult.rows[0];
  
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
      const memberAdminQuery = `
      SELECT user_id FROM group_memberships WHERE group_id = $1 AND role = 'admin'
    `;
    const memberAdminResult = await client.query(memberAdminQuery, [id]);
    const isMemberAdmin = memberAdminResult.rows.some(row => row.user_id === memberId);

    if (isMemberAdmin) {
      return NextResponse.json({ error: 'Cannot remove Group Admin!' }, { status: 403 });
    }
      const deleteQuery = `
        DELETE FROM group_memberships WHERE group_id = $1 AND user_id = $2
        RETURNING *
      `;
      const result = await client.query(deleteQuery, [id, memberId]);
      client.release();
  
      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'User not found in event' }, { status: 404 });
      }
  
      return NextResponse.json({ message: `${memberInfo.username} removed from group` });
    } catch (error) {
      console.error('Error removing user:', error);
      return NextResponse.json({ error: 'Error removing user' }, { status: 500 });
    }
  }
  