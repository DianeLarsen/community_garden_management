const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const setup = async () => {
  try {
    const client = await pool.connect();
    const setupSql = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');
    await client.query(setupSql);
    console.log('Database setup complete.');
    client.release();
  } catch (err) {
    console.error('Error setting up the database:', err);
    process.exit(1);
  }
};

setup();
