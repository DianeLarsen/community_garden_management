import { NextResponse } from "next/server";
import pool from "@/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const groupId = searchParams.get("groupId");
  const userId = searchParams.get("userId");
  const days = parseInt(searchParams.get("days")) || null;
  const gardenId = searchParams.get("gardenId");
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];
    let index = 1;

    if (groupId) {
      filters.push(`gp.group_id = $${index}`);
      values.push(parseInt(groupId, 10));
      index++;
    }
    if (userId) {
      filters.push(`gp.user_id = $${index}`);
      values.push(parseInt(userId, 10));
      index++;
    }
    if (days !== null) {
      filters.push(
        `(ph.reserved_until <= (NOW() + interval '${days} days'))`
      );
    }
    if (gardenId) {
      filters.push(`gp.garden_id = $${index}`);
      values.push(parseInt(gardenId, 10));
      index++;
    }

    const filterQuery = filters.length ? `AND ${filters.join(" AND ")}` : "";

    const client = await pool.connect();

    const result = await client.query(
      `
      SELECT 
        gp.id, gp.name, gp.user_id, gp.group_id, 
        ph.reserved_at, ph.reserved_until,
        u.email, g.name as group_name
      FROM 
        garden_plots gp
      JOIN 
        plot_history ph ON gp.id = ph.plot_id
      LEFT JOIN 
        users u ON gp.user_id = u.id
      LEFT JOIN 
        groups g ON gp.group_id = g.id
      WHERE 
        AND ph.reserved_until >= NOW()
        ${filterQuery}
      ORDER BY 
        ph.reserved_at ASC
      LIMIT $${index} OFFSET $${index + 1}
    `,
      [...values, limit, offset]
    );

    const totalResult = await client.query(
      `
      SELECT 
        COUNT(*) as total
      FROM 
        garden_plots gp
      JOIN 
        plot_history ph ON gp.id = ph.plot_id
      WHERE 
        ph.reserved_until >= NOW()
        ${filterQuery}
    `,
      values
    );

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "No reserved plots found" });
    }

    return NextResponse.json({
      plots: result.rows,
      total: totalResult.rows[0].total,
    });
  } catch (error) {
    console.error("Error fetching reserved plots:", error);
    return NextResponse.json(
      { error: "Error fetching reserved plots" },
      { status: 500 }
    );
  }
}
