import type { NextRequest } from "next/server"

import { auth0 } from "./lib/auth0" // Adjust path if your auth0 client is elsewhere

export async function middleware(request: NextRequest) {
  console.log('Middleware called for path:', request.nextUrl.pathname);
  
  // Add specific logging for auth routes
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    console.log('Auth route accessed:', request.nextUrl.pathname);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  }

  const response = await auth0.middleware(request);
  
  // Log response status for auth routes
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    console.log('Auth route response status:', response.status);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}