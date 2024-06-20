-- Drop existing tables if they exist
DROP TABLE IF EXISTS group_memberships CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS garden_plots CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    verification_token VARCHAR(64),
    verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'member'
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create group memberships table
CREATE TABLE IF NOT EXISTS group_memberships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    group_id INTEGER REFERENCES groups(id),
    role VARCHAR(50) DEFAULT 'member', -- 'member' or 'admin'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create garden plots table
CREATE TABLE IF NOT EXISTS garden_plots (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'reserved', 'occupied'
    user_id INTEGER REFERENCES users(id),
    reserved_at TIMESTAMP,
    occupied_at TIMESTAMP
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_id INTEGER REFERENCES events(id),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -- Sample data for users
-- INSERT INTO users (email, password, verified, role) VALUES 
-- ('user1@example.com', 'password1', true, 'member'),
-- ('user2@example.com', 'password2', true, 'member'),
-- ('admin@example.com', 'password3', true, 'admin');

-- Sample data for groups
INSERT INTO groups (name, description) VALUES 
('Garden Enthusiasts', 'A group for people who love gardening'),
('Organic Growers', 'A group focused on organic gardening practices');

-- Sample data for group memberships
INSERT INTO group_memberships (user_id, group_id, role) VALUES 
(1, 1, 'member'),
(2, 2, 'member'),
(3, 1, 'admin');

-- Sample data for events
INSERT INTO events (name, description, date, location) VALUES 
('Spring Planting', 'An event to plant spring crops', '2024-06-01', 'Community Garden'),
('Harvest Festival', 'Celebrating the fall harvest', '2024-09-15', 'Community Garden');

-- Sample data for event registrations
INSERT INTO event_registrations (user_id, event_id) VALUES 
(1, 1),
(2, 2),
(3, 1);

-- Sample data for garden plots
INSERT INTO garden_plots (location, size, status, user_id) VALUES 
('Plot A', '10x10', 'occupied', 1),
('Plot B', '20x20', 'available', NULL),
('Plot C', '15x15', 'reserved', 2);
