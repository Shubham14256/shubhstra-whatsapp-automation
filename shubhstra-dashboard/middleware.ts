/**
 * Next.js Middleware
 * Protects all routes except /login and /payment
 * Checks authentication and subscription status
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Not used in middleware
        },
        remove(name: string, options: any) {
          // Not used in middleware
        },
      },
    }
  );

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is NOT logged in
  if (!user) {
    // Allow access to /login
    if (pathname === '/login') {
      return NextResponse.next();
    }
    // Redirect to login for all other routes
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // User IS logged in - check subscription status
  try {
    // Fetch doctor's subscription status
    const { data: doctorData, error } = await supabase
      .from('doctors')
      .select('subscription_status, plan_expiry_date')
      .eq('email', user.email)
      .single();

    if (error) {
      console.error('Error fetching subscription status:', error);
      // If error fetching subscription, allow access (fail open)
      return await updateSession(request);
    }

    // Check if subscription is expired
    const isExpired = doctorData?.subscription_status === 'expired' ||
      (doctorData?.plan_expiry_date && new Date(doctorData.plan_expiry_date) < new Date());

    // If subscription is expired
    if (isExpired) {
      // Allow access to /payment page
      if (pathname === '/payment') {
        return NextResponse.next();
      }
      // Redirect to payment page for all other routes
      return NextResponse.redirect(new URL('/payment', request.url));
    }

    // Subscription is active
    // If trying to access /login or /payment, redirect to home
    if (pathname === '/login' || pathname === '/payment') {
      return NextResponse.redirect(new URL('/', request.url));
    }

  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow access (fail open)
  }

  // Update session (refresh if needed)
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
