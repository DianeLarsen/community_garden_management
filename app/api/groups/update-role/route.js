import { NextResponse } from 'next/server';
import pool from '@/db';

export async function POST(request) {
  const { userId, groupId, role } = await request.json();

  const updateRoleQuery = 'UPDATE group_memberships SET role = $1 WHERE user_id = $2 AND group_id = $3 RETURNING *';
  const result = await pool.query(updateRoleQuery, [role, userId, groupId]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Role update failed' }, { status: 400 });
  }

  return NextResponse.json({ message: 'Role updated successfully', membership: result.rows[0] });
}
