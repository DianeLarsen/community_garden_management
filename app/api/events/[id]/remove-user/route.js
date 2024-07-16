import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function POST(request, { params }) {
    const { id } = params;
    const { userId } = await request.json();
    console.log(userId)
    const token = request.cookies.get('token')?.value;
  
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const adminId = decoded.userId;
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
      const isOrganizer = event.user_id === adminId;
  
      const groupAdminQuery = `
        SELECT user_id FROM group_memberships WHERE group_id = $1 AND role = 'admin'
      `;
      const groupAdminResult = await client.query(groupAdminQuery, [event.group_id]);
      const isGroupAdmin = groupAdminResult.rows.some(row => row.user_id === adminId);
  
      if (!isAdmin && !isOrganizer && !isGroupAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
  
      const deleteQuery = `
        DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2
        RETURNING *
      `;
      const result = await client.query(deleteQuery, [id, userId]);
      client.release();
  
      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'User not found in event' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'User removed from event' });
    } catch (error) {
      console.error('Error removing user:', error);
      return NextResponse.json({ error: 'Error removing user' }, { status: 500 });
    }
  }
  