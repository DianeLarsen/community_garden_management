require('dotenv').config();
// utils/db.js

// Import the Pool class from the 'pg' package
const { Pool } = require('pg');

// Create a new Pool instance with the database connection details
const pool = new Pool({
    user: process.env.PGUSER,        // Database user from environment variable
    host: process.env.PGHOST,        // Database host from environment variable
    database: process.env.PGDATABASE, // Database name from environment variable
    password: process.env.PGPASSWORD, // Database password from environment variable
    port: process.env.PGPORT,        // Database port from environment variable
});

// Attempt to connect to the database and log the result
pool.connect()
    .then(() => console.log("Connected to the database"))
    .catch(err => console.error("Database connection error:", err));

// Export the pool instance for use in other modules
module.exports = pool;
