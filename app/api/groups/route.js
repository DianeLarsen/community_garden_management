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
        groups.id, groups.name, groups.description, 
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
  const { name, description, userId } = await request.json();

  try {
    const client = await pool.connect();

    // Insert new group into the database
    const createGroupQuery = 'INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING *';
    const result = await client.query(createGroupQuery, [name, description]);
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
