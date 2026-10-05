import { createServerClient } from "@supabase/ssr";
import { NextFetchEvent, NextResponse, type NextRequest } from "next/server";
import { getClientIp } from "@/lib/request";
import { proxyRateLimit } from "@/lib/rate-limit";

export async function proxy(request: NextRequest, context: NextFetchEvent) {
  let response = NextResponse.next({ request });
  const ip = getClientIp(request.headers);
  const rateLimit = await proxyRateLimit.limit(`ip:${ip}`);

  context.waitUntil(rateLimit.pending);

  if (!rateLimit.success) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "Retry-After": "10",
        "Cache-Control": "no-store",
      },
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
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

  const protectedPaths = ["/admin"];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isProtectedRoute && user.app_metadata?.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("error", "forbidden");
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname === "/turnos/resumen" && request.nextUrl.searchParams.has("token")) {
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
  }

  response.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
  response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
