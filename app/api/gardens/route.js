// api/gardens/route.js
import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';
import getLatLonFromZipCode from '@/utils/getLatLonFromZipCode';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get('zipCode');
  const maxDistance = searchParams.get('maxDistance') || 5; // Default to 5 miles
  const limit = searchParams.get('limit') || 10; // Default to 10
  const distanceInMeters = maxDistance * 1609.34;

  if (!zipCode) {
    return NextResponse.json({ error: 'Zip code is required' }, { status: 400 });
  }

  try {
    const { lat, lon } = await getLatLonFromZipCode(zipCode);
    console.log(lat, lon)

    const query = `
      SELECT gardens.name, garden_plots.size, garden_plots.status, 
             ST_Distance(gardens.geolocation, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance
      FROM garden_plots
      JOIN gardens ON garden_plots.garden_id = gardens.id
      WHERE ST_DWithin(gardens.geolocation::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3) -- Convert miles to meters
      ORDER BY distance
      LIMIT $4
    `;
    const values = [lon, lat, distanceInMeters, limit];

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No plots found within the specified distance' });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error searching plots:', error);
    return NextResponse.json({ error: 'Error searching plots' }, { status: 500 });
  }
}
