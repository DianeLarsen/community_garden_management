// api/gardens/route.js
import { NextResponse } from "next/server";
import pool from "@/db";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const client = await pool.connect();

    const gardenResult = await client.query(
      `SELECT id, name, location, ST_X(geolocation::geometry) AS lon, ST_Y(geolocation::geometry) AS lat, address, type, description, rentalbeds, availableonsite
       FROM gardens WHERE id = $1`,
      [id]
    );

    if (gardenResult.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: "Invalid garden" }, { status: 400 });
    }

    const garden = gardenResult.rows[0];

    const groupResult = await client.query(
      `SELECT g.id, g.name, g.description
       FROM groups g
       JOIN garden_groups gg ON g.id = gg.group_id
       WHERE gg.garden_id = $1`,
      [id]
    );

    const eventResult = await client.query(
      `SELECT e.id, e.name, e.description, e.start_date, e.end_date
       FROM events e
       WHERE e.garden_id = $1`,
      [id]
    );

    const plotResult = await client.query(
      `SELECT gp.*, ph.reserved_until 
      FROM garden_plots gp
      LEFT JOIN (
      SELECT plot_id, MAX(reserved_until) AS reserved_until
      FROM plot_history
      WHERE reserved_until > NOW()
      GROUP BY plot_id
    ) ph ON gp.id = ph.plot_id
       WHERE garden_id = $1`,
      [id]
    );

    const reservationResult = await client.query(
      `SELECT ph.id, ph.plot_id, ph.user_id, ph.group_id, ph.reserved_at, ph.reserved_until, ph.purpose
       FROM plot_history ph
       JOIN garden_plots gp ON ph.plot_id = gp.id
       WHERE gp.garden_id = $1`,
      [id]
    );

    const inviteResult = await client.query(
      `SELECT gi.id, gi.group_id, gi.user_id, gi.status
       FROM group_invitations gi
       JOIN garden_groups gg ON gi.group_id = gg.group_id
       WHERE gg.garden_id = $1`,
      [id]
    );

    client.release();

    return NextResponse.json({
      garden,
      plots: plotResult.rows,
      groups: groupResult.rows,
      events: eventResult.rows,
      reservations: reservationResult.rows,
      invites: inviteResult.rows,
    });
  } catch (error) {
    console.error("Garden:", error);
    return NextResponse.json(
      { error: "Error fetching garden data" },
      { status: 500 }
    );
  }
}
