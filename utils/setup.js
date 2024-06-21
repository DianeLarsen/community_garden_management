const pool = require('./db');
const bcrypt = require('bcrypt');

async function setupDatabase() {
  const client = await pool.connect();

  try {
    // Create PostGIS extension if it doesn't exist
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis');
    console.log('PostGIS extension created or already exists.');

    // Drop tables if they exist for fresh setup
    await client.query('DROP TABLE IF EXISTS event_registrations, events, garden_plots, group_memberships, groups, users CASCADE');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        verification_token VARCHAR(64),
        verified BOOLEAN DEFAULT FALSE,
        role VARCHAR(50) DEFAULT 'member'
      )
    `);
    console.log('Users table created.');

    // Create groups table
    await client.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Groups table created.');

    // Create group memberships table
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_memberships (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        group_id INTEGER REFERENCES groups(id),
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Group memberships table created.');

    // Create garden plots table
    await client.query(`
      CREATE TABLE IF NOT EXISTS garden_plots (
        id SERIAL PRIMARY KEY,
        location GEOGRAPHY(POINT, 4326) NOT NULL,
        size VARCHAR(50),
        status VARCHAR(50) DEFAULT 'available',
        user_id INTEGER REFERENCES users(id),
        group_id INTEGER REFERENCES groups(id), -- Added group_id column
        reserved_at TIMESTAMP,
        occupied_at TIMESTAMP
      )
    `);
    console.log('Garden plots table created.');

    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Events table created.');

    // Create event registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        event_id INTEGER REFERENCES events(id),
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Event registrations table created.');

    // Insert sample data
    const hashedPassword1 = await bcrypt.hash('password1', 10);
    const hashedPassword2 = await bcrypt.hash('password2', 10);
    const hashedPassword3 = await bcrypt.hash('password3', 10);

    await client.query(`
      INSERT INTO users (email, password, verified, role) VALUES 
      ('user1@example.com', '${hashedPassword1}', true, 'member'),
      ('user2@example.com', '${hashedPassword2}', true, 'member'),
      ('admin@example.com', '${hashedPassword3}', true, 'admin')
    `);
    console.log('Sample users inserted.');

    await client.query(`
      INSERT INTO groups (name, description) VALUES 
      ('Garden Enthusiasts', 'A group for people who love gardening'),
      ('Organic Growers', 'A group focused on organic gardening practices')
    `);
    console.log('Sample groups inserted.');

    await client.query(`
      INSERT INTO group_memberships (user_id, group_id, role) VALUES 
      (1, 1, 'member'),
      (2, 2, 'member'),
      (3, 1, 'admin')
    `);
    console.log('Sample group memberships inserted.');

    await client.query(`
      INSERT INTO events (name, description, date, location) VALUES 
      ('Spring Planting', 'An event to plant spring crops', '2024-06-01', 'Community Garden'),
      ('Harvest Festival', 'Celebrating the fall harvest', '2024-09-15', 'Community Garden')
    `);
    console.log('Sample events inserted.');

    await client.query(`
      INSERT INTO event_registrations (user_id, event_id) VALUES 
      (1, 1),
      (2, 2),
      (3, 1)
    `);
    console.log('Sample event registrations inserted.');

    await client.query(`
      INSERT INTO garden_plots (location, size, status, user_id, group_id) VALUES 
      (ST_SetSRID(ST_MakePoint(-122.3321, 47.6062), 4326), '10x10', 'occupied', 1, 1),
      (ST_SetSRID(ST_MakePoint(-122.3321, 47.6062), 4326), '20x20', 'available', NULL, NULL),
      (ST_SetSRID(ST_MakePoint(-122.3321, 47.6062), 4326), '15x15', 'reserved', 2, 2)
    `);
    console.log('Sample garden plots inserted.');
  } catch (error) {
    console.error('Error setting up the database:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = setupDatabase;
