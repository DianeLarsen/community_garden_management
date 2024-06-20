import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function POST(request) {
  const { name, description, userId } = await request.json();

  // Insert new group into the database
  const createGroupQuery = 'INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING *';
  const result = await pool.query(createGroupQuery, [name, description]);
  const group = result.rows[0];

  // Add the creator as an admin member
  const addAdminQuery = 'INSERT INTO group_memberships (user_id, group_id, role) VALUES ($1, $2, $3)';
  await pool.query(addAdminQuery, [userId, group.id, 'admin']);

  return NextResponse.json({ message: 'Group created successfully', group });
}
