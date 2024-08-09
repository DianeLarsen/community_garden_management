import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const publicPaths = ["/", "/about", "/register", "/verify", "/password-reset-request"];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  if (!token) {

    if (isPublicPath) {
      return NextResponse.next();
    } else {

      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);

    return NextResponse.next();
  } catch (err) {
    console.log(err)
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
