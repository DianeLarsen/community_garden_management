// api/plots/[id].js
import { NextResponse } from "next/server";
import pool from "@/db";

export async function GET(request, { params }) {
  const { id } = params;
  console.log(id);
  try {
    const client = await pool.connect();

    const result = await client.query(
      `SELECT gp.*, 
              u.username AS reserved_by, 
              ph.reserved_at AS reservation_start, 
              ph.reserved_at + (ph.duration * interval '1 week') AS reservation_end
       FROM garden_plots gp
       LEFT JOIN plot_history ph ON gp.id = ph.plot_id
       LEFT JOIN users u ON ph.user_id = u.id
       WHERE gp.id = $1
       ORDER BY ph.reserved_at DESC
       LIMIT 1`,  // Assuming you want the most recent reservation
      [id]
    );

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching plot details:", error);
    return NextResponse.json(
      { error: "Error fetching plot details" },
      { status: 500 }
    );
  }
}
