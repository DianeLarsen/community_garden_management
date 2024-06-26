// api/gardens/route.js
import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';
import getLatLonFromZipCode from '@/utils/getLatLonFromZipCode';
import getLatLonFromAddress from '@/utils/getLatLonFromAddress';

export async function GET(request) {
  try {
    console.error("made it here");
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('searchTerm');
    const maxDistance = searchParams.get('maxDistance') || 5; // Default to 5 miles
    const limit = searchParams.get('limit') || 10; // Default to 10
    const distanceInMeters = maxDistance * 1609.34;
    console.error("Search Term:", searchTerm);

    if (!searchTerm) {
      return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
    }

    let lat, lon;

    // Check if the searchTerm is a zip code, address, or city
    if (/\b9\d{4}\b/.test(searchTerm)) {
      console.error("zipcode", searchTerm);
      // It's a zip code
      ({ lat, lon } = await getLatLonFromZipCode(searchTerm));
    } else {
      console.error("not zip code", searchTerm);
      // Assume it's an address or city
      ({ lat, lon } = await getLatLonFromAddress(searchTerm));
    }

    const query = `
      SELECT gardens.id, gardens.name, COUNT(garden_plots.id) AS available_plots,
             ST_Distance(gardens.geolocation, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance
      FROM gardens
      JOIN garden_plots ON garden_plots.garden_id = gardens.id
      WHERE garden_plots.status = 'available'
      AND ST_DWithin(gardens.geolocation::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
      GROUP BY gardens.id
      ORDER BY distance
      LIMIT $4
    `;
    const values = [lon, lat, distanceInMeters, limit];

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No gardens found within the specified distance' });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error searching gardens:', error);
    return NextResponse.json({ error: 'Error searching gardens' }, { status: 500 });
  }
}
