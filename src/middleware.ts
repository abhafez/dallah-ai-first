import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Provide internationalization middleware
const intlMiddleware = createMiddleware(routing);

// Ensure these check against pathes without locale
const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract locale from the path if present (e.g. /en/dashboard -> /dashboard)
  const pathnameIsMissingLocale = routing.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  
  // Strip locale temporarily to perform exact match on path string
  let pathWithoutLocale = pathname;
  if (!pathnameIsMissingLocale) {
    const localePrefix = pathname.split("/")[1];
    pathWithoutLocale = pathname.replace(`/${localePrefix}`, "") || "/";
  }

  const token = request.cookies.get("auth_token")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  // Determine current locale (fallback to default)
  const locale = pathnameIsMissingLocale ? routing.defaultLocale : pathname.split("/")[1];

  // Redirect unauthenticated users trying to access protected routes
  if (isProtected && !token) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("from", pathWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Fallback to i18n middleware for general locale management
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
