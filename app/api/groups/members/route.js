import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('groupId');

  const getMembersQuery = 'SELECT users.id, users.email, group_memberships.role FROM users JOIN group_memberships ON users.id = group_memberships.user_id WHERE group_memberships.group_id = $1';
  const result = await pool.query(getMembersQuery, [groupId]);
  return NextResponse.json(result.rows);
}
