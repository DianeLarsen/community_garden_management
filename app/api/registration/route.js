// app/api/community-garden/registration/route.js

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '@/utils/db';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request) {
  const { email, password } = await request.json();

  // Hash the user's password for secure storage
  const hashedPassword = await bcrypt.hash(password, 10);
  // Generate a random token for email verification
  const token = crypto.randomBytes(32).toString('hex');

  try {
    const client = await pool.connect();

    // Check if the email is already registered
    const emailCheckQuery = 'SELECT * FROM users WHERE email = $1';
    const emailCheckResult = await client.query(emailCheckQuery, [email]);

    if (emailCheckResult.rowCount > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Insert the new user into the 'users' table
    const insertQuery = 'INSERT INTO users (email, password, verification_token) VALUES ($1, $2, $3)';
    await client.query(insertQuery, [email, hashedPassword, token]);

    // Set up the email transporter using nodemailer
    const transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the following link: ${process.env.BASE_URL}/api/verify?token=${token}`,
    };

    // Send the verification email
    await transporter.sendMail(mailOptions);

    client.release();
    return NextResponse.json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
