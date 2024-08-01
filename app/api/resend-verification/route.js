import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export async function POST(request) {
  const { email } = await request.json();

  try {
    const client = await pool.connect();

    // Check if the email exists and is not verified
    const userQuery = 'SELECT id FROM users WHERE email = $1 AND verified = false';
    const userResult = await client.query(userQuery, [email]);

    if (userResult.rowCount === 0) {
      client.release();
      return NextResponse.json({ error: 'Email not found or already verified' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Create a JWT token with the user's email and an expiration time
    const token = jwt.sign(
      { email, userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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
    await transporter.sendMail(mailOptions);

    client.release();
    return NextResponse.json({ message: 'Verification email resent.' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
