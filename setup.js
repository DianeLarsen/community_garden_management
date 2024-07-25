const fs = require("fs");
const path = require("path");
const pool = require("./db");
const bcrypt = require("bcrypt");

async function setupDatabase() {
  const client = await pool.connect();

  try {
    // Create PostGIS extension if it doesn't exist
    await client.query("CREATE EXTENSION IF NOT EXISTS postgis");
    console.log("PostGIS extension created or already exists.");

    // Drop tables if they exist for fresh setup
    await client.query(
      "DROP TABLE IF EXISTS plot_history, event_registrations, events, event_invitations, garden_plots, group_memberships, groups, group_invitations, users, gardens CASCADE"
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
        zip VARCHAR(10),
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
      location VARCHAR(10),
      accepting_members BOOLEAN DEFAULT TRUE,
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS group_invitations (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id),
        user_id INTEGER REFERENCES users(id),
        requester_id INTEGER REFERENCES users(id),
        status VARCHAR(50) NOT NULL
      );
    `);
    console.log("Group invitations table created.");

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

    // Create garden groups table
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
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        length VARCHAR(50),
        width  VARCHAR(50),
        status VARCHAR(50) DEFAULT 'available',
        user_id INTEGER REFERENCES users(id),
        group_id INTEGER REFERENCES groups(id),
        reserved_at TIMESTAMP,
        occupied_at TIMESTAMP,
        CHECK (status = 'available' OR (user_id IS NOT NULL OR group_id IS NOT NULL))
      )
    `);
    console.log("Garden plots table created.");

    // Create plot history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS plot_history (
        id SERIAL PRIMARY KEY,
        plot_id INTEGER REFERENCES garden_plots(id),
        user_id INTEGER REFERENCES users(id),
        group_id INTEGER REFERENCES groups(id),
        reserved_at TIMESTAMP,
        duration INTEGER, -- Duration in weeks
        purpose TEXT
      )
    `);
    console.log("Plot history table created.");

  // Create events table
await client.query(`
  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    plot_id INTEGER REFERENCES garden_plots(id),
    group_id INTEGER REFERENCES groups(id),
    user_id INTEGER REFERENCES users(id),
    garden_id INTEGER REFERENCES gardens(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT TRUE
  )
`);
console.log("Events table created.");

// Create event invitations table
await client.query(`
  CREATE TABLE IF NOT EXISTS event_invitations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    user_id INTEGER REFERENCES users(id),
    requester_id INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL
  )
`);
console.log("Event invitations table created.");

// Create event registrations table
await client.query(`
  CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_id INTEGER REFERENCES events(id),
    group_id INTEGER REFERENCES groups(id),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log("Event registrations table created.");

    // Insert sample users
    const hashedPassword1 = await bcrypt.hash("password1", 10);
    const hashedPassword2 = await bcrypt.hash("password2", 10);
    const hashedPassword3 = await bcrypt.hash("password3", 10);
    const hashedPassword4 = await bcrypt.hash("password4", 10);
    const hashedPassword5 = await bcrypt.hash("password5", 10);

    await client.query(`
     INSERT INTO users (email, username, street_address, city, state, zip, phone, password, verified, role, profile_photo) VALUES 
     ('user1@example.com', 'user1', '123 Main St', 'Everett', 'WA', '98201', '555-1234', '${hashedPassword1}', true, 'member', 'https://res.cloudinary.com/dqjh46sk5/image/upload/v1721671734/oog637olg8zbgyrhwaia.png'),
     ('user2@example.com', 'user2', '456 Oak St', 'Lynnwood', 'WA', '98036', '555-5678', '${hashedPassword2}', true, 'member', null),
     ('admin@example.com', 'admin', '789 Pine St', 'Snohomish', 'WA', '98290', '555-9012', '${hashedPassword3}', true, 'admin', 'https://res.cloudinary.com/dqjh46sk5/image/upload/v1690320204/u2adaxxniq1jge3nmggd.jpg'),
     ('user3@example.com', 'user3', '101 Elm St', 'Everett', 'WA', '98201', '555-0000', '${hashedPassword4}', true, 'member', 'https://res.cloudinary.com/dqjh46sk5/image/upload/v1689184463/ji2wveaa129ihu1rnh8u.jpg'),
     ('user4@example.com', 'user4', '202 Birch St', 'Lynnwood', 'WA', '98036', '555-1111', '${hashedPassword5}', true, 'member', 'https://res.cloudinary.com/dqjh46sk5/image/upload/v1690383115/anakkjb4jr9ebbwqb6eh.jpg')
   `);
    console.log("Sample users inserted.");

    await client.query(`
      INSERT INTO groups (name, description, location, accepting_members) VALUES 
      ('Garden Enthusiasts', 'A group for people who love gardening', '98272', true),
      ('Organic Growers', 'A group focused on organic gardening practices', '98223 ', true),
      ('Urban Farmers', 'A group for city dwellers interested in farming', '98207', true),
      ('Herb Growers', 'A group dedicated to growing herbs', '98208', true),
      ('Vegetable Planters', 'A group focused on planting vegetables', '98050', true)
    `);
    console.log("Sample groups inserted.");

    // Insert sample group memberships
    await client.query(`
     INSERT INTO group_memberships (user_id, group_id, role) VALUES 
      (1, 1, 'admin'),
  (2, 2, 'admin'),
  (3, 3, 'admin'),
  (4, 4, 'admin'),
  (5, 5, 'admin'),
  (1, 2, 'member'),
  (2, 3, 'member'),
  (3, 4, 'member'),
  (4, 5, 'member'),
  (5, 1, 'member')
    `);
    console.log("Sample group memberships inserted.");

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
          garden.contacts
            ? JSON.stringify(garden.contacts)
            : JSON.stringify([]), // Default to empty array if not provided
          garden.links ? JSON.stringify(garden.links) : JSON.stringify([]), // Default to empty array if not provided
        ]
      );
    }
    console.log("Sample gardens inserted.");

    // Insert sample garden plots
    const plotSizes = ["4x4", "4x6", "4x8", "4x10", "4x12"];
const plotStatuses = ["available", "reserved"];

const gardensWithRentalBeds = await client.query(
  "SELECT id, name FROM gardens WHERE rentalBeds = true"
);

for (const garden of gardensWithRentalBeds.rows) {
  for (let i = 1; i <= 20; i++) {
    const size = plotSizes[Math.floor(Math.random() * plotSizes.length)];
    const length = size.split("x")[0];
    const width = size.split("x")[1];
    const status =
      plotStatuses[Math.floor(Math.random() * plotStatuses.length)];
    const plotName = `${garden.name} Plot ${i}`;
    
    let user_id = null;
    let group_id = null;
    let reserved_at = null;
    let duration = null;
    let purpose = null;

    if (status === 'reserved') {
      user_id = Math.floor(Math.random() * 5) + 1; // Random user_id between 1 and 5
      reserved_at = new Date();
      duration = Math.floor(Math.random() * 12) + 1; // Random duration between 1 and 12 weeks
      purpose = 'Random purpose'; // Example purpose, replace as needed
    }

    const result = await client.query(
      `
      INSERT INTO garden_plots (garden_id, name, location, length, width, status, user_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [garden.id, plotName, `Plot ${i}`, length, width, status, user_id]
    );

    const plot_id = result.rows[0].id;

    if (status === 'reserved') {
      await client.query(
        `
        INSERT INTO plot_history (plot_id, user_id, group_id, reserved_at, duration, purpose) 
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [plot_id, user_id, group_id, reserved_at, duration, purpose]
      );
    }
  }
}
console.log("Sample garden plots and plot history inserted.");



    await client.query(`
      INSERT INTO events (name, description, start_date, end_date, group_id, user_id, garden_id, plot_id, is_public) VALUES
      ('Community Gardening Day', 'Join us for a community gardening day!', '2024-08-20 09:00:00', '2024-08-20 12:00:00', 1, 1, 1, 1, TRUE),
      ('Organic Farming Workshop', 'Learn about organic farming techniques.', '2024-08-22 14:00:00', '2024-08-22 17:00:00', 2, 2, 2, 21, FALSE),
      ('Urban Farming Meetup', 'Meet other urban farmers and share tips.', '2024-07-25 18:00:00', '2024-07-25 21:00:00', 3, 3, 3, 41, TRUE),
      ('Herb Gardening Class', 'Discover the secrets of herb gardening.', '2024-07-28 10:00:00', '2024-07-28 13:00:00', 4, 4, 4, 61, TRUE),
      ('Vegetable Planting Session', 'Hands-on vegetable planting session.', '2024-07-30 15:00:00', '2024-07-30 18:00:00', 5, 5, 5, 81, FALSE)
    `);
    console.log("Sample events inserted.");
    
    await client.query(`
      INSERT INTO event_registrations (user_id, event_id, group_id) VALUES
      (1, 1, 1),
      (2, 2, 2),
      (3, 3, 3),
      (4, 4, 4),
      (5, 5, 5),
      (1, 2, 1),
      (2, 3, 2),
      (3, 4, 3),
      (4, 5, 4),
      (5, 1, 5)
    `);
    console.log("Sample event registration inserted.");
  } catch (error) {
    console.error("Error setting up the database:", error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = setupDatabase;
