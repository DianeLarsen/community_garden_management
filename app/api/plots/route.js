import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const groupId = searchParams.get('groupId');
  const gardenId = searchParams.get('gardenId');


  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await pool.connect();

    // Find groups the user is part of
    const groupQuery = 'SELECT group_id FROM group_memberships WHERE user_id = $1';
    const groupResult = await client.query(groupQuery, [userId]);
    const groupIds = groupResult.rows.map(row => row.group_id);

    // Find garden plots associated with the user, their groups, or specific garden
    let plotQuery = `
      SELECT 
        gp.id, gp.size, gp.status, gp.garden_id, gp.user_id, gp.group_id, 
        g.name AS garden_name, u.email AS user_email, gr.name AS group_name
      FROM 
        garden_plots gp
      LEFT JOIN 
        gardens g ON gp.garden_id = g.id
      LEFT JOIN 
        users u ON gp.user_id = u.id
      LEFT JOIN 
        groups gr ON gp.group_id = gr.id
      WHERE 
        gp.user_id = $1
    `;

    const values = [userId];

    if (groupIds.length > 0) {
      plotQuery += ` OR gp.group_id = ANY($2::int[])`;
      values.push(groupIds);
    }

    if (groupId) {
      plotQuery += values.length > 1 ? ' OR gp.group_id = $3' : ' AND gp.group_id = $2';
      values.push(groupId);
    }

    if (gardenId) {
      console.log(gardenId)
      plotQuery += values.length > 1 ? ' OR gp.garden_id = $4' : ' AND gp.garden_id = $2';
      values.push(gardenId);
    }

    const plotResult = await client.query(plotQuery, values);

    client.release();
    if (plotResult.rows.length === 0) {
      return NextResponse.json({ message: 'No plots found for the given criteria' });
    }

    return NextResponse.json(plotResult.rows);
  } catch (error) {
    console.error('Error fetching plots:', error);
    return NextResponse.json({ error: 'Error fetching plots' }, { status: 500 });
  }
}
