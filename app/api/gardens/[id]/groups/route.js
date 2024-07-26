// api/gardens/[id]/groups.js
import { NextResponse } from "next/server";
import pool from "@/db";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const client = await pool.connect();

    const query = `
      SELECT 
        g.*, 
        COALESCE(json_agg(json_build_object('user_id', u.id, 'username', u.username, 'email', u.email, 'role', gm.role)) FILTER (WHERE gm.user_id IS NOT NULL), '[]') AS members,
        COALESCE(json_agg(json_build_object('invite_id', gi.id, 'user_id', iu.id, 'username', iu.username, 'email', iu.email, 'status', gi.status)) FILTER (WHERE gi.id IS NOT NULL), '[]') AS invitations,
        COUNT(gp.id) AS reserved_plots
      FROM 
        groups g
      LEFT JOIN 
        garden_plots gp ON g.id = gp.group_id AND gp.garden_id = $1
      LEFT JOIN 
        group_memberships gm ON g.id = gm.group_id
      LEFT JOIN 
        users u ON gm.user_id = u.id
      LEFT JOIN 
        group_invitations gi ON g.id = gi.group_id
      LEFT JOIN 
        users iu ON gi.user_id = iu.id
      WHERE 
        gp.garden_id = $1
      GROUP BY 
        g.id
    `;
    
    const result = await client.query(query, [id]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No groups found for this garden.' });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching groups for garden:", error);
    return NextResponse.json(
      { error: "Error fetching groups for garden." },
      { status: 500 }
    );
  }
}
