import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '@/db';
import nodemailer from 'nodemailer';

export async function POST(request) {
  const { email, password } = await request.json();

  // Hash the user's password for secure storage
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a JWT token with the user's email and an expiration time
  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // token expires in 1 hour
  );

  let client;
  try {
    client = await pool.connect();

    // Check if the email is already registered
    const emailCheckQuery = 'SELECT * FROM users WHERE email = $1';
    const emailCheckResult = await client.query(emailCheckQuery, [email]);

    if (emailCheckResult.rowCount > 0) {
      const user = emailCheckResult.rows[0];
      if (user.verified) {
        client.release();
        return NextResponse.json({ error: 'Email already registered and verified. Would you like to reset your password?', resetPassword: true }, { status: 400 });
      } else {
        // User exists but is not verified
        client.release();
        return NextResponse.json({ error: 'Email already registered but not yet verified. Would you like to resend the verification email?', resendVerification: true }, { status: 400 });
      }
    }

    // Insert the new user into the 'users' table
    const insertQuery = 'INSERT INTO users (email, password, verification_token) VALUES ($1, $2, $3)';
    await client.query(insertQuery, [email, hashedPassword, token]);

    client.release();
  } catch (error) {
    console.error('Error registering user:', error);
    if (client) client.release();
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  // Set up the email transporter using nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    auth: {
      user: process.env.NEXT_EMAIL_USER,
      pass: process.env.NEXT_EMAIL_PASS,
    },
  });

  // Define the email options
  const mailOptions = {
    from: process.env.NEXT_EMAIL_USER,
    to: email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking the following link: ${process.env.BASE_URL}/api/verify?token=${token}`,
  };

  // Send the verification email
  transporter.sendMail(mailOptions).catch((error) => {
    console.error('Error sending verification email:', error);
    // Log the error but do not send an error response to the client
  });

  return NextResponse.json({ message: 'Registration successful. Please check your email to verify your account.' });
}
