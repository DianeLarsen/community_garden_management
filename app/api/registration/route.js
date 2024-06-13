import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  const { email, password } = await req.json();

  // Perform server-side validation
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // Check if email is already registered (pseudo-code)
  // const user = await findUserByEmail(email);
  // if (user) {
  //   return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
  // }

  // Save user to database with unverified status and generate verification token
  const verificationToken = uuidv4();
  const user = { email, password, verificationToken, verified: false };
  // saveUserToDatabase(user); // Pseudo-code for saving user

  // Send verification email
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking the following link: ${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verificationToken}`
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Verification email sent' });
  } catch (error) {
    return NextResponse.json({ error: 'Error sending verification email' }, { status: 500 });
  }
}
