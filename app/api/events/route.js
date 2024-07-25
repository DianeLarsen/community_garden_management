import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';
import getLatLonFromZipCode from '@/utils/getLatLonFromZipCode';

export async function GET(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
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
    if (!userZip) {
      client.release();
      return NextResponse.json({ error: 'User does not have a ZIP code' }, { status: 400 });
    }

    const { lat, lon } = await getLatLonFromZipCode(userZip);

    const result = await client.query(`
      SELECT 
        e.*, 
        g.available_plots, 
        gd.name AS garden_name,
        ST_Distance(gd.geolocation, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance,
        COUNT(inv.id) AS pending_invitations
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
      LEFT JOIN 
        event_invitations inv ON e.id = inv.event_id AND inv.status = 'pending'
      GROUP BY 
        e.id, g.available_plots, gd.name, gd.geolocation
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
  const { name, description, start_date, end_date, garden_id, plot_id, user_id, group_id, is_public } = await request.json();

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

    // Check for overlapping events on the same plot
    const overlapQuery = `
      SELECT id FROM events
      WHERE plot_id = $1 AND (start_date, end_date) OVERLAPS ($2::timestamp, $3::timestamp)
    `;
    const overlapResult = await client.query(overlapQuery, [plot_id, start_date, end_date]);

    if (overlapResult.rowCount > 0) {
      client.release();
      return NextResponse.json({ error: 'This plot is already reserved for the selected time period' }, { status: 400 });
    }

    // Insert new event
    const insertQuery = `
      INSERT INTO events (name, description, start_date, end_date, garden_id, plot_id, user_id, group_id, is_public)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `;
    const result = await client.query(insertQuery, [name, description, start_date, end_date, garden_id, plot_id, user_id, group_id || null, is_public]);

    client.release();
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { name, description, start_date, end_date, plot_id, group_id, is_public } = await request.json();

    const client = await pool.connect();
    const updateQuery = `
      UPDATE events
      SET name = $1, description = $2, start_date = $3, end_date = $4, plot_id = $5, group_id = $6, is_public = $7
      WHERE id = $8 AND (user_id = $9 OR $10 = 'admin')
      RETURNING *
    `;
    const updateResult = await client.query(updateQuery, [name, description, start_date, end_date, plot_id, group_id, is_public, id, userId, decoded.role]);
    client.release();

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event updated successfully', event: updateResult.rows[0] });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Error updating event' }, { status: 500 });
  }
}
