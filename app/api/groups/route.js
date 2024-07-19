import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from "jsonwebtoken";

// GET Method
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('searchTerm');
  const userInfo = searchParams.get('userInfo' || false);
  const limit = searchParams.get('limit' || 10);
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await pool.connect();

    let query = `
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
        1=1
    `;
    let index = 1;
    const values = [];

    if (searchTerm) {
      query += ` AND (groups.name ILIKE $${index} OR groups.description ILIKE $${index} OR groups.location ILIKE $${index})`;
      values.push(`%${searchTerm}%`);
      index++;
    }

    if (userInfo == 'true') {
      console.log("userInfo")
      query += ` AND groups.id IN (SELECT group_id FROM group_memberships WHERE user_id = $${index})`;
      values.push(userId);
      index++;
    }

    query += ' GROUP BY groups.id';

    if (limit) {
      console.log("limit")
      query += ` LIMIT $${index}`;
      values.push(parseInt(limit));
      index++;
    }

    const result = await client.query(query, values);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No groups found for the given criteria' });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Error fetching groups' }, { status: 500 });
  }
}


// POST Method
export async function POST(request) {
  const { name, description, location, accepting_members, userId } = await request.json();

  try {
    const client = await pool.connect();

    // Insert new group into the database
    const createGroupQuery = 'INSERT INTO groups (name, description, location, accepting_members) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await client.query(createGroupQuery, [name, description, location, accepting_members]);
    const group = result.rows[0];

    // Add the creator as an admin member
    const addAdminQuery = 'INSERT INTO group_memberships (user_id, group_id, role) VALUES ($1, $2, $3)';
    await client.query(addAdminQuery, [userId, group.id, 'admin']);

    client.release();

    return NextResponse.json({ message: 'Group created successfully', group });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Error creating group' }, { status: 500 });
  }
}

// PATCH Method
export async function PATCH(request) {
  const { id, name, description, location, accepting_members } = await request.json();

  try {
    const client = await pool.connect();

    const updateGroupQuery = `
      UPDATE groups
      SET name = $1, description = $2, location = $3, accepting_members = $4
      WHERE id = $5
      RETURNING *
    `;
    const result = await client.query(updateGroupQuery, [name, description, location, accepting_members, id]);
    const group = result.rows[0];

    client.release();

    return NextResponse.json({ message: 'Group updated successfully', group });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json({ error: 'Error updating group' }, { status: 500 });
  }
}

// DELETE Method
export async function DELETE(request) {
  const { id } = await request.json();

  try {
    const client = await pool.connect();

    const deleteGroupQuery = 'DELETE FROM groups WHERE id = $1';
    await client.query(deleteGroupQuery, [id]);

    client.release();

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Error deleting group' }, { status: 500 });
  }
}
