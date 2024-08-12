import { NextResponse } from "next/server";
import pool from "@/db";

export async function GET(request) {
  try {
    const client = await pool.connect();

    // Query for group invitations
    const groupInvitesQuery = `
      SELECT 
        gi.id AS invite_id, 
        gi.group_id, 
        gi.user_id, 
        gi.requester_id, 
        gi.status, 
        'group' AS type,
        g.name AS group_name,
        u.email AS user_email,
        r.email AS requester_email
      FROM 
        group_invitations gi
      JOIN 
        groups g ON gi.group_id = g.id
      JOIN 
        users u ON gi.user_id = u.id
      JOIN 
        users r ON gi.requester_id = r.id
    `;

    const groupInvitesResult = await client.query(groupInvitesQuery);

    // Query for event invitations
    const eventInvitesQuery = `
      SELECT 
        ei.id AS invite_id, 
        ei.event_id, 
        ei.user_id, 
        ei.requester_id, 
        ei.status, 
        'event' AS type,
        e.name AS event_name,
        u.email AS user_email,
        r.email AS requester_email
      FROM 
        event_invitations ei
      JOIN 
        events e ON ei.event_id = e.id
      JOIN 
        users u ON ei.user_id = u.id
      JOIN 
        users r ON ei.requester_id = r.id
    `;

    const eventInvitesResult = await client.query(eventInvitesQuery);

    // Combine results
    const combinedInvites = [
      ...groupInvitesResult.rows.map((invite) => ({
        ...invite,
        group: invite.group_name,
        event: null, // No event for group invites
      })),
      ...eventInvitesResult.rows.map((invite) => ({
        ...invite,
        group: null, // No group for event invites
        event: invite.event_name,
      })),
    ];

    client.release();

    return NextResponse.json({ invites: combinedInvites }, { status: 200 });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Error fetching invitations" },
      { status: 500 }
    );
  }
}
