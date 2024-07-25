import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';
import getLatLonFromZipCode from '@/utils/getLatLonFromZipCode';
import getLatLonFromAddress from '@/utils/getLatLonFromAddress';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('searchTerm');
    const maxDistance = searchParams.get('maxDistance') || 5; // Default to 5 miles
    const limit = searchParams.get('limit') || 10; // Default to 10
    const distanceInMeters = maxDistance * 1609.34;

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let lat, lon;

    if (searchTerm) {
      // Check if the searchTerm is a zip code, address, or city
      if (/\b9\d{4}\b/.test(searchTerm)) {
        // It's a zip code
        ({ lat, lon } = await getLatLonFromZipCode(searchTerm));
      } else {
        // Assume it's an address or city
        ({ lat, lon } = await getLatLonFromAddress(searchTerm));
      }
    } else {
    

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const userId = decoded.userId;

      const client = await pool.connect();
      const userQuery = 'SELECT zip FROM users WHERE id = $1';
      const userResult = await client.query(userQuery, [userId]);
      

      if (userResult.rowCount === 0) {
        client.release();
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const userZip = userResult.rows[0].zip;
      if (!userZip) {
        client.release();
        return NextResponse.json({ error: 'User does not have a ZIP code' }, {redirect: "/profile"}, {bannerText: "Please update profile page with required information"}, {code: "error"},{ status: 400 });
      }
      ({ lat, lon } = await getLatLonFromZipCode(userZip));
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
