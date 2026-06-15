import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/shared/Navbar"
import { MobileNav } from "@/components/shared/MobileNav"
import type { User } from "@/lib/types"

export default async function ShipperLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "shipper") redirect("/")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile as User} />
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">{children}</main>
      <MobileNav role="shipper" />
    </div>
  )
}
