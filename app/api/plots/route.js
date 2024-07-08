import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = request.cookies.get('token')?.value;
  const groupId = searchParams.get('groupId');
  const gardenId = searchParams.get('gardenId');
  const userInfo = searchParams.get('userInfo');

  if (!token && userInfo) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await pool.connect();

    // Build dynamic query
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
        1=1
    `;
    const values = [];
    let index = 1;

    // Add conditions based on the presence of parameters
    if (userId && userInfo) {
      plotQuery += ` AND gp.user_id = $${index}`;
      values.push(userId);
      index++;
    }

    if (groupId) {
      plotQuery += ` AND gp.group_id = $${index}`;
      values.push(groupId);
      index++;
    }

    if (gardenId) {
      plotQuery += ` AND gp.garden_id = $${index}`;
      
      values.push(gardenId);
      index++;
    }
    console.log(plotQuery)
    console.log(values)
    const plotResult = await client.query(plotQuery, values);
    // console.log(plotResult)
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
