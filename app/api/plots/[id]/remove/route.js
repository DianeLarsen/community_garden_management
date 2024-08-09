import { NextResponse } from "next/server";
import pool from "@/db";
import jwt from "jsonwebtoken";

export async function POST(request, { params }) {
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const plotId = params.plotId; // Get the plot ID from the URL

    const client = await pool.connect();

    // Verify that the plot belongs to the user or the user is an admin
    const plotQuery = `
      SELECT user_id FROM garden_plots WHERE id = $1
    `;
    const plotResult = await client.query(plotQuery, [plotId]);

    if (plotResult.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    const plot = plotResult.rows[0];

    if (plot.user_id !== userId) {
      client.release();
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove the reservation
    const removeReservationQuery = `
      UPDATE garden_plots
      SET user_id = NULL, group_id = NULL, status = 'available'
      WHERE id = $1
    `;
    await client.query(removeReservationQuery, [plotId]);

    client.release();

    return NextResponse.json({ message: "Plot reservation removed successfully" });
  } catch (error) {
    console.error("Error removing plot reservation:", error);
    return NextResponse.json({ error: "Error removing plot reservation" }, { status: 500 });
  }
}
