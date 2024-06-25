import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const zipCode = searchParams.get('zipCode');
  const maxDistance = searchParams.get('maxDistance') || 5; // Default to 5 miles
  const limit = searchParams.get('limit') || 10; // Default to 10

  if (token) {
    // Handle fetching plots for the logged-in user
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const query = `SELECT * FROM garden_plots 
                     WHERE user_id = $1 OR group_id IN 
                     (SELECT group_id FROM group_memberships WHERE user_id = $1)`;
      const values = [userId];

      const client = await pool.connect();
      const result = await client.query(query, values);

      await client.release();
      return NextResponse.json(result.rows);
    } catch (error) {
      console.error('Error fetching user plots:', error);
      return NextResponse.json({ error: 'Error fetching user plots' }, { status: 500 });
    }
  } else {
    // Handle searching for available plots based on zip code and distance
    try {
      let query = `SELECT *, ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance
                   FROM garden_plots
                   WHERE status = 'available'`;
      let values = [];

      if (zipCode) {
        const { lat, lon } = await getLatLonFromZipCode(zipCode); // Implement this function
        values.push(lat, lon);
        query += ` AND ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) <= $3`;
        values.push(maxDistance * 1609.34); // Convert miles to meters
      }

      query += ` LIMIT $4`;
      values.push(limit);

      const client = await pool.connect();
      const result = await client.query(query, values);

      await client.release();
      if (result.rows.length === 0) {
        return NextResponse.json({ message: 'No plots found within the specified distance.' });
      }
      return NextResponse.json(result.rows);
    } catch (error) {
      console.error('Error searching plots:', error);
      return NextResponse.json({ error: 'Error searching plots' }, { status: 500 });
    }
  }
}

// Example implementation of getLatLonFromZipCode function
async function getLatLonFromZipCode(zipCode) {
  // Use an API like Zippopotam.us or other geolocation service to get lat, lon
  // For simplicity, return hardcoded values for now
  return { lat: 47.6062, lon: -122.3321 };
}
