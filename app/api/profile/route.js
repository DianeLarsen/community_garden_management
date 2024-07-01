// pages/api/profile.js
import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';
import multer from 'multer';

const upload = multer();

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const username = formData.get('username');
  const streetAddress = formData.get('street_address');
  const city = formData.get('city');
  const state = formData.get('state');
  const zip = formData.get('zip');
  const phone = formData.get('phone');
  const profilePhoto = formData.get('profilePhoto');

  if (!zip) {
    return NextResponse.json({ error: 'Zip code is required' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await pool.connect();
    
    if (username) {
        const usernameCheckQuery = 'SELECT id FROM users WHERE username = $1 AND id != $2';
        const usernameCheckValues = [username, userId];
        const usernameCheckResult = await client.query(usernameCheckQuery, usernameCheckValues);
  
        if (usernameCheckResult.rows.length > 0) {
          client.release();
          return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
        }
      }
    let query = 'UPDATE users SET zip = $1';
    const values = [zip];
    let index = 2;  // Starting index for additional parameters

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

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
  }
}
