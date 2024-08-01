import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const publicPaths = ["/", "/about", "/register", "/verify", "/password-reset-request"];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);
  console.log("middleware", isPublicPath);
  if (!token) {
    if (isPublicPath) {
      return NextResponse.next();
    } else {
      console.log("Shouldnt be here1")
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    console.log(err);
    console.log("Shouldnt be here2")
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
