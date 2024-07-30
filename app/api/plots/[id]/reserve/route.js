// api/plots/[id]/reserve.js

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

    const { reserved_at, reserved_until, purpose, group_id } = await request.json();

    if (!reserved_at || !reserved_until || !purpose) {
      return NextResponse.json({ error: 'Start date, end date, and purpose are required' }, { status: 400 });
    }

    const client = await pool.connect();

    const plotQuery = 'SELECT * FROM garden_plots WHERE id = $1';
    const plotResult = await client.query(plotQuery, [id]);

    if (plotResult.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    const overlappingReservationsQuery = `
      SELECT * FROM plot_history
      WHERE plot_id = $1 AND (
        ($2::timestamp, $3::timestamp) OVERLAPS (reserved_at, reserved_until)
      )
    `;
    const overlappingReservationsResult = await client.query(overlappingReservationsQuery, [id, reserved_at, reserved_until]);

    if (overlappingReservationsResult.rows.length > 0) {
      client.release();
      return NextResponse.json({ error: 'The plot is already reserved for the selected period' }, { status: 400 });
    }

    const reserveQuery = `
      INSERT INTO plot_history (plot_id, user_id, group_id, reserved_at, reserved_until, purpose)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await client.query(reserveQuery, [id, userId, group_id || null, reserved_at, reserved_until, purpose]);

    client.release();

    return NextResponse.json({ message: 'Plot reserved successfully' });
  } catch (error) {
    console.error('Error reserving plot:', error);
    return NextResponse.json({ error: 'Error reserving plot' }, { status: 500 });
  }
}
