import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MobileNav } from "@/components/shared/MobileNav"
import { SessionGuard } from "@/components/shared/SessionGuard"

export default async function DriverCallLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "driver") redirect("/")

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionGuard />
      {children}
      <MobileNav role="driver" />
    </div>
  )
}
