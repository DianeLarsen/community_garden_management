import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function GET(request, { params }) {
  const { id } = params;
  const token = request.cookies.get('token')?.value;

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

    const plotQuery = `
      SELECT gp.*, 
            u.username AS reserved_by, 
            ph.reserved_at AS reservation_start, 
            ph.reserved_until AS reservation_end,
            g.name AS garden_name
      FROM garden_plots gp
      LEFT JOIN plot_history ph ON gp.id = ph.plot_id
      LEFT JOIN users u ON ph.user_id = u.id
      LEFT JOIN gardens g ON gp.garden_id = g.id
      WHERE gp.id = $1
      ORDER BY ph.reserved_at DESC
      LIMIT 1
    `;
    const plotResult = await client.query(plotQuery, [id]);

    if (plotResult.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    const plot = plotResult.rows[0];

    const gardenQuery = `SELECT * FROM gardens WHERE id = $1`;
    const gardenResult = await client.query(gardenQuery, [plot.garden_id]);
    const garden = gardenResult.rows[0];

    const historyQuery = `
      SELECT * 
      FROM plot_history 
      WHERE plot_id = $1 
      ORDER BY reserved_at DESC
    `;
    const historyResult = await client.query(historyQuery, [id]);
    const history = historyResult.rows;

    const eventsQuery = `
      SELECT e.*, u.username AS organizer
      FROM events e
      JOIN users u ON e.user_id = u.id
      WHERE e.plot_id = $1
      ORDER BY e.start_date
    `;
    const eventsResult = await client.query(eventsQuery, [id]);

    const groupsQuery = `
      SELECT 
        gr.* 
      FROM 
        groups gr
      JOIN 
        group_memberships gm ON gr.id = gm.group_id
      WHERE 
        gm.user_id = $1
    `;
    const groupsResult = await client.query(groupsQuery, [userId]);
    const groups = groupsResult.rows;

    const userQuery = `SELECT * FROM users WHERE id = $1`;
    const userResult = await client.query(userQuery, [userId]);
    const user = userResult.rows[0];

    client.release();

    return NextResponse.json({
      plot,
      garden,
      history,
      groups,
      user,
      isAdmin: user.is_admin,
      events: eventsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching plot details:', error);
    return NextResponse.json({ error: 'Error fetching plot details' }, { status: 500 });
  }
}
