import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const role = searchParams.get("role")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role, verification_status")
          .eq("id", user.id)
          .single()

        if (!profile?.role) {
          // New social user — no profile yet
          const url = role ? `${origin}/onboarding?role=${role}` : `${origin}/onboarding`
          return NextResponse.redirect(url)
        }

        // Existing user — check verification
        if (profile.verification_status !== "verified") {
          return NextResponse.redirect(`${origin}/verification`)
        }

        if (profile.role === "driver") return NextResponse.redirect(`${origin}/driver/dashboard`)
        if (profile.role === "shipper") return NextResponse.redirect(`${origin}/shipper/dashboard`)
        if (profile.role === "admin") return NextResponse.redirect(`${origin}/admin/dashboard`)
      }
      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
