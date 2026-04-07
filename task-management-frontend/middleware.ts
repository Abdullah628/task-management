import { NextRequest, NextResponse } from 'next/server';

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/audit') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/users')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('tm_token')?.value;
  const role = request.cookies.get('tm_role')?.value;

  if (!token && isProtectedPath(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  if (pathname.startsWith('/audit') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/tasks/:path*', '/audit/:path*', '/profile/:path*', '/users/:path*'],
};
