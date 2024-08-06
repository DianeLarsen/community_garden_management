import { NextResponse } from "next/server";
import pool from "@/db";
import jwt from "jsonwebtoken";

async function getCityFromZip(zip) {
  try {
    const response = await fetch(`http://api.zippopotam.us/us/${zip}`);
    if (!response.ok) {
      throw new Error("Error fetching city from zip code");
    }
    const data = await response.json();
    return data.places[0]["place name"];
  } catch (error) {
    console.error("Error fetching city from zip code:", error);
    return null;
  }
}

export async function GET(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = parseInt(decoded.userId, 10);



    const client = await pool.connect();
    console.log("made it here ")
    const userZipQuery = "SELECT zip FROM users WHERE id = $1";
    const userZIPResult = await client.query(userZipQuery, [userId]);

    if (userZIPResult.rowCount === 0) {
      client.release();
      return NextResponse.json({ error: "User not found" ,
        redirect: "/",
        bannerText: "Please sign in",
        code: "error"}, { status: 404 });
    }

    const userZip = userZIPResult.rows[0].zip;
    
    if (!userZip) {
      client.release();
      return NextResponse.json(
        {
          error: "User does not have a ZIP code",
          redirect: "/profile",
          bannerText: "Please update profile page with required information",
          code: "error",
        },
        { status: 400 }
      );
    }

    console.log("made it here 0", userZip)
    ({ lat, lon } = await getLatLonFromZipCode(userZip));
    console.log("made it here 1", lat, lon)
    

    const userQuery = `
      SELECT id, email, username, street_address, city, state, zip, phone, role, profile_photo
      FROM users
      WHERE id = $1
    `;
    const userResult = await client.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("made it here 2")
    const user = userResult.rows[0];

    const userEventsQuery = `
      SELECT e.*
      FROM events e
      WHERE e.id IN (
          SELECT event_id FROM event_invitations WHERE user_id = $1
      )
      OR e.id IN (
          SELECT event_id FROM event_registrations WHERE user_id = $1
      )
    `;
    const userEventsResult = await client.query(userEventsQuery, [userId]);
    console.log("made it here 3")
    const groupsQuery =
      user.role === "admin"
        ? `
        SELECT 
          g.id, g.name, g.description, g.location, g.accepting_members,
          (SELECT COUNT(*) FROM group_memberships WHERE group_id = g.id) AS members_count,
          COALESCE(json_agg(json_build_object('user_id', u.id, 'username', u.username, 'email', u.email, 'role', gm.role)) FILTER (WHERE gm.user_id IS NOT NULL), '[]') AS members,
          COALESCE(json_agg(json_build_object('invite_id', gi.id, 'user_id', iu.id, 'username', iu.username, 'email', iu.email, 'status', gi.status)) FILTER (WHERE gi.id IS NOT NULL), '[]') AS invitations,
          COUNT(gp.id) FILTER (WHERE gp.group_id = g.id) AS reserved_plots
        FROM groups g
        LEFT JOIN group_memberships gm ON g.id = gm.group_id
        LEFT JOIN users u ON gm.user_id = u.id
        LEFT JOIN group_invitations gi ON g.id = gi.group_id
        LEFT JOIN users iu ON gi.user_id = iu.id
        LEFT JOIN garden_plots gp ON g.id = gp.group_id
        GROUP BY g.id
      `
        : `
        SELECT 
          g.id, g.name, g.description, g.location, gm.role, g.accepting_members,
          (SELECT COUNT(*) FROM group_memberships WHERE group_id = g.id) AS members_count,
          COALESCE(json_agg(json_build_object('user_id', u.id, 'username', u.username, 'email', u.email, 'role', gm.role)) FILTER (WHERE gm.user_id IS NOT NULL), '[]') AS members,
          COALESCE(json_agg(json_build_object('invite_id', gi.id, 'user_id', iu.id, 'username', iu.username, 'email', iu.email, 'status', gi.status)) FILTER (WHERE gi.id IS NOT NULL), '[]') AS invitations,
          COUNT(gp.id) FILTER (WHERE gp.group_id = g.id) AS reserved_plots
        FROM groups g
        LEFT JOIN group_memberships gm ON g.id = gm.group_id
        LEFT JOIN users u ON gm.user_id = u.id
        LEFT JOIN group_invitations gi ON g.id = gi.group_id
        LEFT JOIN users iu ON gi.user_id = iu.id
        LEFT JOIN garden_plots gp ON g.id = gp.group_id
        WHERE gm.user_id = $1
        GROUP BY g.id, gm.role
      `;
    const groupsResult = await client.query(groupsQuery, [userId]);
    console.log("made it here 4")
    const invitesQuery = `
      SELECT g.id, g.name, g.description, g.location, gi.status
      FROM groups g
      JOIN group_invitations gi ON g.id = gi.group_id
      WHERE gi.user_id = $1
    `;
    const invitesResult = await client.query(invitesQuery, [userId]);

    const plotsQuery = `
      SELECT gp.id, gp.name, gp.location, gp.length, gp.width, gp.user_id, gp.group_id, gp.garden_id
      FROM garden_plots gp
      WHERE gp.user_id = $1
    `;
    const plotsResult = await client.query(plotsQuery, [userId]);
    console.log("made it here 5")
    for (let group of groupsResult.rows) {
      group.city = await getCityFromZip(group.location);
    }

    for (let invite of invitesResult.rows) {
      invite.city = await getCityFromZip(invite.location);
    }
    console.log("made it here 6")
    client.release();

    return NextResponse.json({
      profile: user,
      groups: groupsResult.rows,
      invites: invitesResult.rows,
      plots: plotsResult.rows,
      events: userEventsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Error fetching profile" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const username = formData.get("username");
  const streetAddress = formData.get("street_address");
  const city = formData.get("city");
  const state = formData.get("state");
  const zip = formData.get("zip");
  const phone = formData.get("phone");
  const profilePhoto = formData.get("profilePhoto");

  if (!zip) {
    return NextResponse.json(
      { error: "Zip code is required" },
      { status: 400 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await pool.connect();

    let query = "UPDATE users SET zip = $1";
    const values = [zip];
    let index = 2; // Starting index for additional parameters

    if (username) {
      query += `, username = $${index}`;
      values.push(username);
      index++;
    }
    if (streetAddress) {
      query += `, street_address = $${index}`;
      values.push(streetAddress);
      index++;
    }
    if (city) {
      query += `, city = $${index}`;
      values.push(city);
      index++;
    }
    if (state) {
      query += `, state = $${index}`;
      values.push(state);
      index++;
    }
    if (phone) {
      query += `, phone = $${index}`;
      values.push(phone);
      index++;
    }
    if (profilePhoto) {
      query += `, profile_photo = $${index}`;
      values.push(profilePhoto);
      index++;
    }

    query += ` WHERE id = $${index}`;
    values.push(userId);

    await client.query(query, values);
    client.release();

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Error updating profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const username = formData.get("username");
  const streetAddress = formData.get("street_address");
  const city = formData.get("city");
  const state = formData.get("state");
  const zip = formData.get("zip");
  const phone = formData.get("phone");
  const profilePhoto = formData.get("profilePhoto");

  if (!zip) {
    return NextResponse.json(
      { error: "Zip code is required" },
      { status: 400 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await pool.connect();

    let query = "UPDATE users SET zip = $1";
    const values = [zip];
    let index = 2; // Starting index for additional parameters

    if (username) {
      query += `, username = $${index}`;
      values.push(username);
      index++;
    }
    if (streetAddress) {
      query += `, street_address = $${index}`;
      values.push(streetAddress);
      index++;
    }
    if (city) {
      query += `, city = $${index}`;
      values.push(city);
      index++;
    }
    if (state) {
      query += `, state = $${index}`;
      values.push(state);
      index++;
    }
    if (phone) {
      query += `, phone = $${index}`;
      values.push(phone);
      index++;
    }
    if (profilePhoto) {
      query += `, profile_photo = $${index}`;
      values.push(profilePhoto);
      index++;
    }

    query += ` WHERE id = $${index}`;
    values.push(userId);

    await client.query(query, values);
    client.release();

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Error updating profile" },
      { status: 500 }
    );
  }
}
