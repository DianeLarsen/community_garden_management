const express = require('express');
const next = require('next');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const helmet = require('helmet');
const setupDatabase = require('./setup');

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;
console.log('Database URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    // Test the database connection
    await pool.connect();
    console.log('Connected to the database');

    // Setup the database
    await setupDatabase();

    // Prepare the Next.js app
    await app.prepare();

    const server = express();

    // Middleware to force HTTPS
    server.use((req, res, next) => {
      if (req.headers['x-forwarded-proto'] !== 'https' && !dev) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
    });

    // Add Helmet for security headers
    server.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"],
          },
        },
        referrerPolicy: { policy: 'no-referrer' },
        frameguard: { action: 'deny' },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        noSniff: true,
        xssFilter: true,
        expectCt: {
          enforce: true,
          maxAge: 86400,
        },
      })
    );

    server.all('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
})();
