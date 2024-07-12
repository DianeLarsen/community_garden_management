import { NextResponse } from 'next/server';
import pool from '@/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const garden = searchParams.get('garden');
  const group = searchParams.get('group');

  try {
    const client = await pool.connect();
    let query = `SELECT * FROM events WHERE 1=1`;
    const values = [];

    if (location) {
      query += ` AND location ILIKE $${values.length + 1}`;
      values.push(`%${location}%`);
    }
    if (garden) {
      query += ` AND garden_id = $${values.length + 1}`;
      values.push(garden);
    }
    if (group) {
      query += ` AND group_id = $${values.length + 1}`;
      values.push(group);
    }

    const result = await client.query(query, values);
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Error fetching events' }, { status: 500 });
  }
}

export async function POST(request) {
  const { name, description, date, location, garden_id, group_id } = await request.json();

  try {
    const client = await pool.connect();
    const insertQuery = `
      INSERT INTO events (name, description, date, location, garden_id, group_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const result = await client.query(insertQuery, [name, description, date, location, garden_id, group_id]);
    client.release();

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
  }
}
