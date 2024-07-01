import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');
  const groupId = searchParams.get('groupId');
  const gardenId = searchParams.get('gardenId');

  if (!userId && !groupId && !gardenId) {
    return NextResponse.json({ error: 'At least one of userId, groupId, or gardenId is required' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    let query = 'SELECT gp.id, gp.size, gp.status, gp.garden_id, gp.user_id, gp.group_id, g.name as garden_name, u.email as user_email, gr.name as group_name FROM garden_plots gp';
    query += ' LEFT JOIN gardens g ON gp.garden_id = g.id';
    query += ' LEFT JOIN users u ON gp.user_id = u.id';
    query += ' LEFT JOIN groups gr ON gp.group_id = gr.id';
    query += ' WHERE 1=1';

    const values = [];

    if (userId) {
      query += ' AND gp.user_id = $1';
      values.push(userId);
    }
    
    if (groupId) {
      query += values.length ? ' AND gp.group_id = $2' : ' AND gp.group_id = $1';
      values.push(groupId);
    }

    if (gardenId) {
      query += values.length ? ' AND gp.garden_id = $3' : ' AND gp.garden_id = $1';
      values.push(gardenId);
    }

    const result = await client.query(query, values);

    client.release();
    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No plots found for the given criteria' });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching plots:', error);
    return NextResponse.json({ error: 'Error fetching plots' }, { status: 500 });
  }
}
