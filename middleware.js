// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const currentUser = request.cookies.get('token')?.value;

  const publicPaths = ['/', '/about'];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  if (!currentUser && !isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (currentUser && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url)); // Change this to your main authenticated page
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/about', '/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
