// api/gardens/route.js
import { NextResponse } from "next/server";
import pool from "@/db";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const client = await pool.connect();

    const result = await client.query(
      "SELECT  id, name, location, ST_X(geolocation::geometry) AS lon, ST_Y(geolocation::geometry) AS lat, address, type, description, rentalbeds, availableonsite FROM gardens WHERE id = $1",
      [id]
    );

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid garden" }, { status: 400 });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Garden:", error);
    return NextResponse.json(
      { error: "Error funding garden" },
      { status: 500 }
    );
  }
}
