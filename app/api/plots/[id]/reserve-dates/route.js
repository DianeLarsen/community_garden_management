// /api/plots/[id]/reserved-dates.js

import { NextResponse } from 'next/server';
import pool from '@/db';

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const client = await pool.connect();

    const reservedDatesQuery = `
      SELECT reserved_at AS start_date, reserved_until AS end_date
      FROM plot_history
      WHERE plot_id = $1
    `;
    const reservedDatesResult = await client.query(reservedDatesQuery, [id]);

    client.release();

    return NextResponse.json({ reservedDates: reservedDatesResult.rows });
  } catch (error) {
    console.error('Error fetching reserved dates:', error);
    return NextResponse.json({ error: 'Error fetching reserved dates' }, { status: 500 });
  }
}
