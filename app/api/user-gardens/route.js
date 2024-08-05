// pages/api/user-gardens.js
import { NextResponse } from 'next/server';
import pool from '@/db'; // Ensure this path is correct based on your project structure

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const distance = 5; // 5 miles

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    
    // SQL query to get gardens within 5 miles, associated with a plot they reserved, or a group they are in
    const query = `
      SELECT DISTINCT g.*
      FROM gardens g
      LEFT JOIN garden_plots gp ON g.id = gp.garden_id
      LEFT JOIN plot_history ph ON gp.id = ph.plot_id
      LEFT JOIN group_memberships gm ON g.id = gm.group_id
      LEFT JOIN groups gr ON gm.group_id = gr.id
      WHERE 
        ST_DWithin(g.geolocation, (
          SELECT geolocation 
          FROM users 
          WHERE id = $1
        )::geography, $2 * 1609.34) -- 5 miles in meters
        OR ph.user_id = $1
        OR gm.user_id = $1;
    `;

    const { rows } = await client.query(query, [userId, distance]);
    
    client.release();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching user gardens:', error);
    return NextResponse.json({ error: 'Error fetching user gardens' }, { status: 500 });
  }
}

export default GET;
