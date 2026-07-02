import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Public paths — no auth required
  const publicPaths = ["/", "/login", "/signup", "/intro", "/verify-email", "/auth/callback", "/terms", "/privacy"]
  const isPublic = publicPaths.some(p => path === p || path.startsWith("/auth/")) || path.startsWith("/api/")

  if (!user && !isPublic && path !== "/onboarding") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (!user) return response

  // Fetch profile (role + verification_status)
  const { data: profile } = await supabase
    .from("users")
    .select("role, verification_status")
    .eq("id", user.id)
    .single()

  // No profile yet → onboarding
  if (!profile?.role) {
    if (path !== "/onboarding") return NextResponse.redirect(new URL("/onboarding", request.url))
    return response
  }

  const { role, verification_status } = profile

  // Redirect logged-in verified users away from auth/landing pages
  if (path === "/" || path === "/login" || path === "/signup") {
    if (verification_status !== "verified") {
      return NextResponse.redirect(new URL("/verification", request.url))
    }
    if (role === "shipper") return NextResponse.redirect(new URL("/shipper/dashboard", request.url))
    if (role === "driver") return NextResponse.redirect(new URL("/driver/dashboard", request.url))
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  // KYC gate — unverified/rejected users must complete verification
  // (Allow: /verification itself, /intro, /profile, API routes, onboarding)
  const kycExempt = ["/verification", "/onboarding", "/intro", "/profile"]
  const isKycExempt = kycExempt.some(p => path === p || path.startsWith(p + "/")) || path.startsWith("/api/")

  if (!isKycExempt && verification_status !== "verified") {
    return NextResponse.redirect(new URL("/verification", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
