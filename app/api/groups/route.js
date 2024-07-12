import { NextResponse } from 'next/server';
import pool from '@/db';

// GET Method
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const gardenId = searchParams.get('gardenId');

  try {
    const client = await pool.connect();

    let query = `
      SELECT 
        groups.id, groups.name, groups.description, groups.location, groups.accepting_members,
        COALESCE(json_agg(garden_groups.garden_id) FILTER (WHERE garden_groups.garden_id IS NOT NULL), '[]') AS gardens
      FROM 
        groups
      LEFT JOIN 
        garden_groups ON groups.id = garden_groups.group_id
      LEFT JOIN 
        group_memberships ON groups.id = group_memberships.group_id
      WHERE 
        1=1
    `;
    const values = [];

    if (userId) {
      query += ' AND group_memberships.user_id = $1';
      values.push(userId);
    }

    if (gardenId) {
      query += values.length ? ' AND garden_groups.garden_id = $2' : ' AND garden_groups.garden_id = $1';
      values.push(gardenId);
    }

    query += ' GROUP BY groups.id';

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
