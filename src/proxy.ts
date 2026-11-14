/**
 * FashionTech AI - Next.js 16 Proxy (replaces deprecated middleware)
 *
 * Handles authentication-based route protection and Supabase cookie
 * forwarding using the Next.js 16 proxy convention.
 *
 * Security:
 * - Protected routes require authenticated session
 * - Auth routes redirect authenticated users to dashboard
 * - Uses Supabase SSR client with cookie handling
 * - Validates identity server-side via auth.getClaims()
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          supabaseResponse = NextResponse.next({
            request,
          });
          supabaseResponse.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          supabaseResponse = NextResponse.next({
            request,
          });
          supabaseResponse.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Server-side identity verification using getClaims()
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const user = claims
    ? { sub: claims.sub as string, email: claims.email as string }
    : null;

  const protectedRoutes = [
    "/dashboard",
    "/techpack",
    "/flatsketch",
    "/line-sheet",
    "/projects",
    "/settings",
  ];
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);

  // Redirect unauthenticated users away from protected routes
  if (!user) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  // Redirect authenticated users away from auth routes
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
