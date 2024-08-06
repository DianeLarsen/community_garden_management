import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  const clearTokenResponse = () => {
    const response = NextResponse.redirect("/api/logout");
    response.cookies.set("token", "", { maxAge: -1, path: "/" });
    return response;
  };

  if (!token) {
    return clearTokenResponse();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    // Check if the token has expired
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    if (decoded.exp < now) {
      // Token has expired, log out the user
      return clearTokenResponse();
    }

    // If token is valid, refresh it
    const newToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json({ token: newToken });
    response.cookies.set("token", newToken, { maxAge: 3600, path: "/" });
    return response;
  } catch (error) {
    return clearTokenResponse();
  }
}
