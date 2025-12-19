import { NextResponse } from 'next/server';

export function middleware(request) {
    // Defines paths that are public
    const publicPaths = ['/login', '/_next/static', '/_next/image', '/favicon.ico', '/api/auth/login'];

    // Check if the requested path is public
    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isPublicPath) {
        return NextResponse.next();
    }

    // Check for auth cookie
    const token = request.cookies.get('auth_token');

    if (!token) {
        // Redirect to login page if no token found
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (except api/auth/login which we handle in logic)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
