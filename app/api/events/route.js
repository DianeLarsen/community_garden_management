import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';
import getLatLonFromZipCode from '@/utils/getLatLonFromZipCode';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await pool.connect();
    const userQuery = 'SELECT zip FROM users WHERE id = $1';
    const userResult = await client.query(userQuery, [userId]);
    if (userResult.rowCount === 0) {
      client.release();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userZip = userResult.rows[0].zip;
    const { lat, lon } = await getLatLonFromZipCode(userZip);

    const result = await client.query(`
      SELECT 
        e.*, 
        g.available_plots, 
        gd.name AS garden_name,
        ST_Distance(gd.geolocation, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance
      FROM 
        events e
      LEFT JOIN (
        SELECT 
          garden_id, 
          COUNT(*) as available_plots
        FROM 
          garden_plots
        WHERE 
          status = 'available'
        GROUP BY 
          garden_id
      ) g ON e.garden_id = g.garden_id
      JOIN 
        gardens gd ON e.garden_id = gd.id
    `, [lon, lat]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No events found' });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Error fetching events' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { name, description, date, garden_id, plot_id, user_id, group_id } = await request.json();

  try {
    const client = await pool.connect();

    // Check if the plot is reserved by the user or their group
    const plotQuery = `
      SELECT p.id
      FROM garden_plots p
      LEFT JOIN group_memberships gm ON gm.group_id = p.group_id
      WHERE p.id = $1 AND (p.user_id = $2 OR (gm.user_id = $2 AND gm.group_id = $3))
    `;
    const plotResult = await client.query(plotQuery, [plot_id, user_id, group_id || null]);

    if (plotResult.rowCount === 0) {
      client.release();
      return NextResponse.json({ error: 'Plot not reserved by user or their group' }, { status: 403 });
    }

    // Insert new event
    const insertQuery = `
      INSERT INTO events (name, description, date, garden_id, plot_id, user_id, group_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const result = await client.query(insertQuery, [name, description, date, garden_id, plot_id, user_id, group_id || null]);

    client.release();
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
  }
}
