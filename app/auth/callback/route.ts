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
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile?.role === "driver") return NextResponse.redirect(`${origin}/driver/dashboard`)
        if (profile?.role === "shipper") return NextResponse.redirect(`${origin}/shipper/dashboard`)
        if (profile?.role === "admin") return NextResponse.redirect(`${origin}/admin/dashboard`)

        // New social user — no profile yet
        const onboardingUrl = role
          ? `${origin}/onboarding?role=${role}`
          : `${origin}/onboarding`
        return NextResponse.redirect(onboardingUrl)
      }
      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
