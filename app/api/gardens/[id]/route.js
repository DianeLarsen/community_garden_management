// api/gardens/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function GET(request, { params }) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM gardens WHERE id = $1', [params.id]);
    await client.release();
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching garden details:', error);
    return NextResponse.json({ error: 'Error fetching garden details' }, { status: 500 });
  }
}
