import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function POST(request, { params }) {
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

    const { duration, purpose, group_id } = await request.json();

    if (!duration || !purpose) {
      return NextResponse.json({ error: 'Duration and purpose are required' }, { status: 400 });
    }

    const client = await pool.connect();

    const plotQuery = 'SELECT * FROM garden_plots WHERE id = $1';
    const plotResult = await client.query(plotQuery, [id]);

    if (plotResult.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    const plot = plotResult.rows[0];

    if (plot.status !== 'available') {
      client.release();
      return NextResponse.json({ error: 'Plot is not available' }, { status: 400 });
    }

    const reserveQuery = `
      UPDATE garden_plots 
      SET status = 'reserved', user_id = $1, ${group_id ? 'group_id = $2,' : ''} reserved_at = NOW() 
      WHERE id = $${group_id ? 3 : 2}
    `;
    const reserveValues = group_id ? [userId, group_id, id] : [userId, id];
    await client.query(reserveQuery, reserveValues);

    const historyQuery = `
      INSERT INTO plot_history (plot_id, user_id, group_id, reserved_at, duration, purpose)
      VALUES ($1, $2, $3, NOW(), $4, $5)
    `;
    await client.query(historyQuery, [id, userId, group_id || null, duration, purpose]);

    client.release();

    return NextResponse.json({ message: 'Plot reserved successfully' });
  } catch (error) {
    console.error('Error reserving plot:', error);
    return NextResponse.json({ error: 'Error reserving plot' }, { status: 500 });
  }
}
