import { NextResponse } from 'next/server';
import pool from '@/utils/db';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request) {
  const { email, password } = await request.json();
  const token = crypto.randomBytes(32).toString('hex');
  const role = 'member'; // default role

  try {
    const client = await pool.connect();

    await client.query(
      'INSERT INTO users (email, password, verification_token, verified, role) VALUES ($1, $2, $3, $4, $5)',
      [email, password, token, false, role]
    );

    await client.release();

    const transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the following link: ${process.env.BASE_URL}/api/verify?token=${token}`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Error registering user' }, { status: 500 });
  }
}
