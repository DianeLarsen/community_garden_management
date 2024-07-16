// pages/api/logout.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  const response = NextResponse.json({ message: 'Logout successful' });
  response.cookies.set('token', '', { maxAge: -1, path: '/' });
  return response;
}
