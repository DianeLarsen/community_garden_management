import { NextResponse } from 'next/server';
import pool from '@/db';

export async function GET() {
  const getGroupsQuery = 'SELECT * FROM groups';
  const result = await pool.query(getGroupsQuery);
  return NextResponse.json(result.rows);
}
