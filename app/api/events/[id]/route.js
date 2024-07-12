import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

export async function GET(request, { params }) {
  const { id } = params;
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = await pool.connect();
    const eventQuery = `
      SELECT e.*, u.username AS organizer
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.id = $1
    `;
    const eventResult = await client.query(eventQuery, [id]);

    if (eventResult.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = eventResult.rows[0];

    const attendeesQuery = `
      SELECT er.user_id, u.username, u.email
      FROM event_registrations er
      LEFT JOIN users u ON er.user_id = u.id
      WHERE er.event_id = $1
    `;
    const attendeesResult = await client.query(attendeesQuery, [id]);
    const attendees = attendeesResult.rows;

    client.release();

    return NextResponse.json({ event, attendees });
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json({ error: 'Error fetching event details' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { name, description, date, location, garden_id, group_id } = await request.json();

    const client = await pool.connect();
    const updateQuery = `
      UPDATE events
      SET name = $1, description = $2, date = $3, location = $4, garden_id = $5, group_id = $6
      WHERE id = $7 AND (organizer_id = $8 OR $9 = 'admin')
      RETURNING *
    `;
    const updateResult = await client.query(updateQuery, [name, description, date, location, garden_id, group_id, id, userId, decoded.role]);
    client.release();

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event updated successfully', event: updateResult.rows[0] });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Error updating event' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { reason } = await request.json();

    const client = await pool.connect();
    const deleteQuery = `
      DELETE FROM events
      WHERE id = $1 AND (organizer_id = $2 OR $3 = 'admin')
      RETURNING *
    `;
    const deleteResult = await client.query(deleteQuery, [id, userId, decoded.role]);
    client.release();

    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    // Log the reason for deletion
    console.log(`Event ${id} deleted by user ${userId} for reason: ${reason}`);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Error deleting event' }, { status: 500 });
  }
}
