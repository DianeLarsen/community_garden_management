import { NextResponse } from "next/server";
import pool from "@/db";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
  const { id } = params;
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const role = decoded.role;

    const client = await pool.connect();
    const eventQuery = `
      SELECT e.*, u.username AS organizer, g.name AS garden_name, gp.name AS plot_name, gm.user_id AS group_admin_id, gr.name AS group_name, e.is_public
      FROM events e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN gardens g ON e.garden_id = g.id
      LEFT JOIN garden_plots gp ON e.plot_id = gp.id
      LEFT JOIN group_memberships gm ON e.group_id = gm.group_id AND gm.role = 'admin'
      LEFT JOIN groups gr ON e.group_id = gr.id
      WHERE e.id = $1
    `;
    const eventResult = await client.query(eventQuery, [id]);

    if (eventResult.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const event = eventResult.rows[0]
    const groupAdmins = eventResult.rows.map((row) => row.group_admin_id);

    if (
      (!groupAdmins.includes(userId) && role != "admin") ||
      eventResult.rows[0]?.is_public == "false"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const attendeesQuery = `
      SELECT er.user_id, u.username, u.email
      FROM event_registrations er
      LEFT JOIN users u ON er.user_id = u.id
      WHERE er.event_id = $1
    `;
    const attendeesResult = await client.query(attendeesQuery, [id]);
    const attendees = attendeesResult.rows;

    const invitationsQuery = `
      SELECT ei.id, ei.user_id, u.username, u.email, ei.status
      FROM event_invitations ei
      LEFT JOIN users u ON ei.user_id = u.id
      WHERE ei.event_id = $1
    `;
    const invitationsResult = await client.query(invitationsQuery, [id]);
    const invitations = invitationsResult.rows;

    client.release();

    return NextResponse.json({
      event: { ...event, group_admins: groupAdmins },
      attendees,
      invitations,
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { error: "Error fetching event details" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { name, description, date, location, garden_id, group_id } =
      await request.json();

    const client = await pool.connect();
    const updateQuery = `
      UPDATE events
      SET name = $1, description = $2, date = $3, location = $4, garden_id = $5, group_id = $6
      WHERE id = $7 AND (organizer_id = $8 OR $9 = 'admin')
      RETURNING *
    `;
    const updateResult = await client.query(updateQuery, [
      name,
      description,
      date,
      location,
      garden_id,
      group_id,
      id,
      userId,
      decoded.role,
    ]);
    client.release();

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Event not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Event updated successfully",
      event: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Error updating event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { reason } = await request.json();

    const client = await pool.connect();
    const deleteQuery = `
      DELETE FROM events
      WHERE id = $1 AND (organizer_id = $2 OR $3 = 'admin')
      RETURNING *
    `;
    const deleteResult = await client.query(deleteQuery, [
      id,
      userId,
      decoded.role,
    ]);
    client.release();

    if (deleteResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Event not found or unauthorized" },
        { status: 404 }
      );
    }

    // Log the reason for deletion
    console.log(`Event ${id} deleted by user ${userId} for reason: ${reason}`);

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Error deleting event" },
      { status: 500 }
    );
  }
}
