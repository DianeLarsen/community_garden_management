import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

// GET Method
export async function GET(request, { params }) {
  const { id } = params;
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const userRole = decoded.role;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await pool.connect();

    const groupQuery = `
      SELECT 
        groups.*, 
        COALESCE(json_agg(json_build_object('user_id', users.id, 'username', users.username, 'email', users.email, 'role', group_memberships.role)) FILTER (WHERE group_memberships.user_id IS NOT NULL), '[]') AS members
      FROM 
        groups
      LEFT JOIN 
        group_memberships ON groups.id = group_memberships.group_id
      LEFT JOIN
        users ON group_memberships.user_id = users.id
      WHERE 
        groups.id = $1
      GROUP BY groups.id
    `;
    const groupResult = await client.query(groupQuery, [id]);
    const group = groupResult.rows[0];

    if (!group) {
      client.release();
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const plotsQuery = `
      SELECT * FROM garden_plots WHERE group_id = $1
    `;
    const plotsResult = await client.query(plotsQuery, [id]);
    const plots = plotsResult.rows;

    const eventsQuery = `
      SELECT e.* 
      FROM events e
      JOIN event_registrations er ON e.id = er.event_id
      WHERE er.group_id = $1
    `;
    const eventsResult = await client.query(eventsQuery, [id]);
    const events = eventsResult.rows;

    const membershipQuery = `
      SELECT role FROM group_memberships WHERE user_id = $1 AND group_id = $2
    `;
    const membershipResult = await client.query(membershipQuery, [userId, id]);
    const role = membershipResult.rows[0]?.role;

    client.release();

    return NextResponse.json({
      group,
      members: group.members,
      plots,
      events,
      isMember: role === 'member' || role === 'admin',
      isAdmin: role === 'admin' || userRole === 'admin',
      isPending: role === 'new',
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    return NextResponse.json({ error: 'Error fetching group details' }, { status: 500 });
  }
}

// PATCH Method for removing and verifying members
export async function PATCH(request, { params }) {
    const id = parseInt(params.id, 10);
    const { action, memberId, role } = await request.json();
    console.log(id, action, memberId, role)
    const token = request.cookies.get('token')?.value;
  
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUserId = decoded.userId;
      const userRole = decoded.role;
      if (!currentUserId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      
      const client = await pool.connect();
  
      const isAdminQuery = `
        SELECT role FROM group_memberships WHERE user_id = $1 AND group_id = $2
      `;
      const isAdminResult = await client.query(isAdminQuery, [currentUserId, id]);
      const isAdmin = isAdminResult.rows[0]?.role === 'admin' || userRole === 'admin';
      console.log("got here1")
      if (!isAdmin) {
        client.release();
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      console.log("got here2")
      if (action == 'remove') {
        const removeMemberQuery = `
          DELETE FROM group_memberships WHERE user_id = $1 AND group_id = $2
        `;
        await client.query(removeMemberQuery, [memberId, id]);
      } else if (action == 'verify') {
        const verifyMemberQuery = `
          UPDATE group_memberships SET role = 'member' WHERE user_id = $1 AND group_id = $2
        `;
        await client.query(verifyMemberQuery, [memberId, id]);
      } else if (action == 'changeRole') {
        console.log("got here3")
        const changeRoleQuery = `
          UPDATE group_memberships SET role = $1 WHERE user_id = $2 AND group_id = $3
        `;
        await client.query(changeRoleQuery, [role, memberId, id]);
      }
  
      client.release();
  
      return NextResponse.json({ message: 'Action completed successfully' });
    } catch (error) {
      console.error('Error updating group membership:', error);
      return NextResponse.json({ error: 'Error updating group membership' }, { status: 500 });
    }
  }
  

// POST Method for requesting membership
export async function POST(request, { params }) {
    const { id } = params;
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
  
      if (!userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
  
      const { userId: requestUserId } = await request.json();
  
      const client = await pool.connect();
  
      const membershipQuery = `
        INSERT INTO group_memberships (user_id, group_id, role) 
        VALUES ($1, $2, 'new') RETURNING *
      `;
      const result = await client.query(membershipQuery, [requestUserId, id]);
  
      client.release();
  
      return NextResponse.json({ message: 'Membership request sent successfully', membership: result.rows[0] });
    } catch (error) {
      console.error('Error requesting membership:', error);
      return NextResponse.json({ error: 'Error requesting membership' }, { status: 500 });
    }
  }
