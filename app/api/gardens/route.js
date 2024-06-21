import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function GET(request) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM gardens');
    await client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching gardens:', error);
    return NextResponse.json({ error: 'Error fetching gardens' }, { status: 500 });
  }
}
