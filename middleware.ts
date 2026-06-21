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

  // Public paths (no auth required)
  const publicPaths = ["/", "/login", "/signup", "/intro", "/verify-email", "/auth/callback"]
  const isPublic = publicPaths.some(p => path === p || path.startsWith("/auth/")) || path.startsWith("/driver/") || path.startsWith("/api/")

  if (!user && !isPublic && path !== "/onboarding") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect logged-in users away from auth/landing pages
  if (user && (path === "/" || path === "/login" || path === "/signup")) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()
    const role = profile?.role
    if (!role) return NextResponse.redirect(new URL("/onboarding", request.url))
    if (role === "shipper") return NextResponse.redirect(new URL("/shipper/dashboard", request.url))
    if (role === "driver") return NextResponse.redirect(new URL("/driver/dashboard", request.url))
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
