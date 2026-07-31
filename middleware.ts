import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

const PUBLIC_ROUTES = ["/signup", "/login", "/verify"];

// Static/metadata assets fetched directly by the browser or crawlers —
// PWA manifest, service worker, offline fallback, and SEO routes. These
// must never redirect to /login: a 307 breaks manifest parsing, service
// worker registration (browsers reject a redirected SW script), and makes
// robots.txt/sitemap.xml unreachable by crawlers.
const PUBLIC_ASSETS = new Set(["/manifest.json", "/sw.js", "/offline.html", "/robots.txt", "/sitemap.xml"]);

export async function middleware(request: NextRequest) {
  // API routes (e.g. the Stripe webhook) are called server-to-server with
  // no browser session — they verify authenticity themselves (signature,
  // etc.) and must never be redirected to /login.
  if (request.nextUrl.pathname.startsWith("/api/") || PUBLIC_ASSETS.has(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!user) {
    if (isPublicRoute) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  if (pathname === "/onboarding") {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.onboarding_completed) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
