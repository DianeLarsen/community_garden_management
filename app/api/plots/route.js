import { NextResponse } from "next/server";
import pool from "@/db";
import jwt from "jsonwebtoken";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = request.cookies.get("token")?.value;
  const groupId = searchParams.get("groupId");
  const gardenId = searchParams.get("gardenId");
  const userInfo = searchParams.get("userInfo") || false;
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const user_id = searchParams.get("user_id") || null;
console.log("Made it here plots")
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const userRole = decoded.role; // Assuming the token contains the user role

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const client = await pool.connect();

    let plotQuery = `
      SELECT 
        gp.id, gp.length, gp.width, gp.garden_id, gp.user_id, gp.group_id, 
        g.name AS garden_name, u.email AS user_email, gr.name AS group_name,
        ph.reserved_at AS start_date, 
        ph.reserved_until AS end_date
      FROM 
        garden_plots gp
      LEFT JOIN 
        gardens g ON gp.garden_id = g.id
      LEFT JOIN 
        users u ON gp.user_id = u.id
      LEFT JOIN 
        groups gr ON gp.group_id = gr.id
      LEFT JOIN 
        plot_history ph ON gp.id = ph.plot_id
      WHERE 
        ph.reserved_until >= CURRENT_DATE
    `;
    const values = [];
    let index = 1;

    if (userInfo && userRole !== "admin") {
      plotQuery += ` AND gp.user_id = $${index}`;
      values.push(user_id || userId);
      index++;
    } else if (userRole === "admin") {
      plotQuery += ` AND u.role = 'event_admin'`;
    }

    if (groupId) {
      plotQuery += ` OR gp.group_id = $${index}`;
      values.push(groupId);
      index++;
    }

    if (gardenId) {
      plotQuery += ` AND gp.garden_id = $${index}`;
      values.push(gardenId);
      index++;
    }

    if (startDate && endDate) {
      plotQuery += `
        AND gp.id NOT IN (
          SELECT plot_id FROM plot_history 
          WHERE reserved_at < $${index + 1} 
          AND reserved_until > $${index}
        )
      `;
      values.push(endDate, startDate);
    }

    const plotResult = await client.query(plotQuery, values);

    client.release();
// console.log(plotResult.rows)
    if (plotResult.rows.length === 0) {
      return NextResponse.json({
        message: "No plots found for the given criteria",
      });
    }

    return NextResponse.json(plotResult.rows);
  } catch (error) {
    console.error("Error fetching plots:", error);
    return NextResponse.json(
      { error: "Error fetching plots" },
      { status: 500 }
    );
  }
}
