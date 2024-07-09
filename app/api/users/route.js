import { NextResponse } from 'next/server';
import pool from '@/db';

export async function GET(request) {
  try {
    const result = await pool.query('SELECT id, email, role, verified FROM users');
    return NextResponse.json({ users: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
    try {
      const body = await request.json();
      const { id, role } = body;
  
      if (!id || !role) {
        return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
      }
  
      const query = 'UPDATE users SET role = $1 WHERE id = $2 RETURNING *';
      const result = await pool.query(query, [role, id]);
  
      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'User role updated successfully', user: result.rows[0] }, { status: 200 });
    } catch (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }