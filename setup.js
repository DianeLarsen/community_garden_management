const fs = require("fs");
const path = require("path");
const pool = require("./db");
const bcrypt = require("bcrypt");
const getLatLonFromAddress = require("./utils/getLatLonFromAddress");

async function setupDatabase() {
  const client = await pool.connect();

  try {
    // Create PostGIS extension if it doesn't exist
    await client.query("CREATE EXTENSION IF NOT EXISTS postgis");
    console.log("PostGIS extension created or already exists.");

    // Drop tables if they exist for fresh setup
    await client.query(
      "DROP TABLE IF EXISTS event_registrations, events, garden_plots, group_memberships, groups, users, gardens CASCADE"
    );

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) UNIQUE,
        street_address VARCHAR(255),
        city VARCHAR(255),
        state VARCHAR(255),
        zip VARCHAR(10) NOT NULL,
        phone VARCHAR(15),
        profile_photo VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        verification_token VARCHAR(64),
        verified BOOLEAN DEFAULT FALSE,
        role VARCHAR(50) DEFAULT 'member'
      )
    `);
    console.log("Users table created.");

    // Create groups table
    await client.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Groups table created.");

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
    console.log("Group memberships table created.");

    // Create gardens table
    await client.query(`
     CREATE TABLE IF NOT EXISTS gardens (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      address VARCHAR(255),
      type VARCHAR(50),
      description TEXT,
      rentalBeds BOOLEAN DEFAULT FALSE,
      availableOnSite BOOLEAN DEFAULT FALSE,
      geolocation GEOGRAPHY(Point, 4326),
      contacts JSONB,
      links JSONB
    );

    `);
    console.log("Gardens table created.");

    await client.query(`
    CREATE TABLE IF NOT EXISTS garden_groups (
      id SERIAL PRIMARY KEY,
      garden_id INTEGER REFERENCES gardens(id),
      group_id INTEGER REFERENCES groups(id)
    );
     `);
    console.log("Garden Groups table created.");

    // Create garden plots table
    await client.query(`
      CREATE TABLE IF NOT EXISTS garden_plots (
        id SERIAL PRIMARY KEY,
        garden_id INTEGER REFERENCES gardens(id),
        location VARCHAR(255) NOT NULL,
        size VARCHAR(50),
        status VARCHAR(50) DEFAULT 'available',
        user_id INTEGER REFERENCES users(id),
        group_id INTEGER REFERENCES groups(id),
        reserved_at TIMESTAMP,
        occupied_at TIMESTAMP
      )
    `);
    console.log("Garden plots table created.");

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
    console.log("Events table created.");

    // Create event registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        event_id INTEGER REFERENCES events(id),
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Event registrations table created.");

    // Insert sample data
    const hashedPassword1 = await bcrypt.hash("password1", 10);
    const hashedPassword2 = await bcrypt.hash("password2", 10);
    const hashedPassword3 = await bcrypt.hash("password3", 10);

    await client.query(`
      INSERT INTO users (email, username, street_address, city, state, zip, phone, password, verified, role) VALUES 
      ('user1@example.com', 'user1', '123 Main St', 'Everett', 'WA', '98201', '555-1234', '${hashedPassword1}', true, 'member'),
      ('user2@example.com', 'user2', '456 Oak St', 'Lynnwood', 'WA', '98036', '555-5678', '${hashedPassword2}', true, 'member'),
      ('admin@example.com', 'admin', '789 Pine St', 'Snohomish', 'WA', '98290', '555-9012', '${hashedPassword3}', true, 'admin')
    `);

    console.log("Sample users inserted.");

    // Insert garden data from JSON file
    const gardensData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data/snocomgar.json"))
    );
    
    for (const garden of gardensData.communityGardens) {
      const location =
        garden.geolocation && Object.keys(garden.geolocation).length > 0
          ? `POINT(${garden.geolocation.lng} ${garden.geolocation.lat})`
          : null;
    
      await client.query(
        `
        INSERT INTO gardens (
          name, location, geolocation, address, type, description, rentalBeds, availableOnSite, contacts, links
        ) VALUES 
        ($1, $2, ST_GeomFromText($3, 4326), $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
      `,
        [
          garden.name ? garden.name : "unknown",
          garden.location ? garden.location : "unknown",
          garden.geolocation ? location : "unknown",
          garden.address ? garden.address : "unknown",
          garden.type ? garden.type : "unknown",
          garden.description ? garden.description : "unknown",
          garden.rentalBeds ? true : false,
          true, // Assuming all gardens are available on the site for demonstration
          garden.contacts ? JSON.stringify(garden.contacts) : JSON.stringify([]), // Default to empty array if not provided
          garden.links ? JSON.stringify(garden.links) : JSON.stringify([]), // Default to empty array if not provided
        ]
      );
    }
    console.log("Sample gardens inserted.");
    


    await client.query(`
      INSERT INTO groups (name, description) VALUES 
      ('Garden Enthusiasts', 'A group for people who love gardening'),
      ('Organic Growers', 'A group focused on organic gardening practices')
    `);
    console.log("Sample groups inserted.");

    await client.query(`
      INSERT INTO group_memberships (user_id, group_id, role) VALUES 
      (1, 1, 'member'),
      (2, 2, 'member'),
      (3, 1, 'admin')
    `);
    console.log("Sample group memberships inserted.");

    await client.query(`
      INSERT INTO events (name, description, date, location) VALUES 
      ('Spring Planting', 'An event to plant spring crops', '2024-06-01', 'Community Garden'),
      ('Harvest Festival', 'Celebrating the fall harvest', '2024-09-15', 'Community Garden')
    `);
    console.log("Sample events inserted.");

    await client.query(`
      INSERT INTO event_registrations (user_id, event_id) VALUES 
      (1, 1),
      (2, 2),
      (3, 1)
    `);
    console.log("Sample event registrations inserted.");

    // Insert sample garden plots for gardens with rentalBeds as true
    const plotSizes = ["4x4", "4x6", "4x8", "4x10", "4x12"];
    const plotStatuses = ["available", "reserved", "occupied"];

    const gardensWithRentalBeds = await client.query(
      "SELECT id FROM gardens WHERE rentalBeds = true"
    );

    for (const garden of gardensWithRentalBeds.rows) {
      for (let i = 1; i <= 20; i++) {
        const size = plotSizes[Math.floor(Math.random() * plotSizes.length)];
        const status =
          plotStatuses[Math.floor(Math.random() * plotStatuses.length)];
        await client.query(
          `
          INSERT INTO garden_plots (garden_id, location, size, status) VALUES 
          ($1, $2, $3, $4)
        `,
          [garden.id, `Plot ${i}`, size, status]
        );
      }
    }
    console.log("Sample garden plots inserted.");
  } catch (error) {
    console.error("Error setting up the database:", error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = setupDatabase;
