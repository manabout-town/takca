import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/shared/Navbar"
import { MobileNav } from "@/components/shared/MobileNav"
import { SessionGuard } from "@/components/shared/SessionGuard"
import type { User } from "@/lib/types"

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "driver") redirect("/")

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionGuard />
      <Navbar user={profile as User} />
      <main className="max-w-5xl mx-auto px-6 py-10 pb-28 md:pb-10">{children}</main>
      <MobileNav role="driver" />
    </div>
  )
}
