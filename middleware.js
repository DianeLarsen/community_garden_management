// middleware.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const publicPaths = ['/', '/about'];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

if(token){
    
    // Token is valid, allow access
    return NextResponse.next();
  } else {
    // Invalid token, redirect to home
    console.log("Invalid token")
    if (isPublicPath){
      return NextResponse.next();
    } else {
    return NextResponse.redirect(new URL('/', request.url));
    }
  }




}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
