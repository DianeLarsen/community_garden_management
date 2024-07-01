import { NextResponse } from 'next/server';
import pool from '@/db';

export async function POST(request) {
  const { userId, groupId } = await request.json();

  // Check if the user is already a member
  const checkMembershipQuery = 'SELECT * FROM group_memberships WHERE user_id = $1 AND group_id = $2';
  const existingMembership = await pool.query(checkMembershipQuery, [userId, groupId]);

  if (existingMembership.rows.length > 0) {
    return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
  }

  // Insert new membership
  const joinGroupQuery = 'INSERT INTO group_memberships (user_id, group_id) VALUES ($1, $2) RETURNING *';
  const newMembership = await pool.query(joinGroupQuery, [userId, groupId]);

  return NextResponse.json({ message: 'Joined group successfully', membership: newMembership.rows[0] });
}
