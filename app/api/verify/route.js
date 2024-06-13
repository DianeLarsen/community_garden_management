import { NextResponse } from 'next/server';

export async function GET(req) {
  const { token } = req.nextUrl.searchParams;

  // Find user with the verification token (pseudo-code)
  // const user = await findUserByVerificationToken(token);

  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  // Verify the user's email (pseudo-code)
  // user.verified = true;
  // saveUserToDatabase(user);

  return NextResponse.json({ message: 'Email verified successfully' });
}
