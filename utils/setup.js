const bcrypt = require('bcrypt');
const pool = require('./db');

// Function to set up the database
const setupDatabase = async () => {
  const client = await pool.connect();

  try {
    // Drop existing tables if they exist
    await client.query(`
      DROP TABLE IF EXISTS group_memberships CASCADE;
      DROP TABLE IF EXISTS garden_plots CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS event_registrations CASCADE;
      DROP TABLE IF EXISTS groups CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          verification_token VARCHAR(64),
          verified BOOLEAN DEFAULT FALSE,
          role VARCHAR(50) DEFAULT 'member'
      );
    `);

    // Create groups table
    await client.query(`
      CREATE TABLE IF NOT EXISTS groups (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create group memberships table
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_memberships (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          group_id INTEGER REFERENCES groups(id),
          role VARCHAR(50) DEFAULT 'member',
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create garden plots table
    await client.query(`
      CREATE TABLE IF NOT EXISTS garden_plots (
          id SERIAL PRIMARY KEY,
          location VARCHAR(255) NOT NULL,
          size VARCHAR(50),
          status VARCHAR(50) DEFAULT 'available',
          user_id INTEGER REFERENCES users(id),
          group_id INTEGER REFERENCES groups(id),
          reserved_at TIMESTAMP,
          occupied_at TIMESTAMP
      );
    `);

    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          date TIMESTAMP NOT NULL,
          location VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create event registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          event_id INTEGER REFERENCES events(id),
          registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample data for users
    const users = [
      { email: 'user1@example.com', password: 'password1', role: 'member' },
      { email: 'user2@example.com', password: 'password2', role: 'member' },
      { email: 'admin@example.com', password: 'password3', role: 'admin' },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await client.query(
        'INSERT INTO users (email, password, verified, role) VALUES ($1, $2, $3, $4)',
        [user.email, hashedPassword, true, user.role]
      );
    }

    // Insert sample data for groups
    await client.query(`
      INSERT INTO groups (name, description) VALUES 
      ('Garden Enthusiasts', 'A group for people who love gardening'),
      ('Organic Growers', 'A group focused on organic gardening practices');
    `);

    // Insert sample data for group memberships
    await client.query(`
      INSERT INTO group_memberships (user_id, group_id, role) VALUES 
      (1, 1, 'member'),
      (2, 2, 'member'),
      (3, 1, 'admin');
    `);

    // Insert sample data for events
    await client.query(`
      INSERT INTO events (name, description, date, location) VALUES 
      ('Spring Planting', 'An event to plant spring crops', '2024-06-01', 'Community Garden'),
      ('Harvest Festival', 'Celebrating the fall harvest', '2024-09-15', 'Community Garden');
    `);

    // Insert sample data for event registrations
    await client.query(`
      INSERT INTO event_registrations (user_id, event_id) VALUES 
      (1, 1),
      (2, 2),
      (3, 1);
    `);

    // Insert sample data for garden plots
    await client.query(`
      INSERT INTO garden_plots (location, size, status, user_id, group_id) VALUES 
      ('Plot A', '10x10', 'occupied', 1, 1),
      ('Plot B', '20x20', 'available', NULL, NULL),
      ('Plot C', '15x15', 'reserved', 2, 2);
    `);

    console.log('Database setup completed successfully.');
  } catch (error) {
    console.error('Error setting up the database:', error);
  } finally {
    client.release();
  }
}

module.exports = setupDatabase;
