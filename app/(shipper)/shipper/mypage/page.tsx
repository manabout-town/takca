import { createClient } from "@/lib/supabase/server"
import { ShipperMypageClient } from "./ShipperMypageClient"

export default async function ShipperMyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: sp }, { data: orders }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user!.id).single(),
    supabase.from("shipper_profiles").select("*").eq("user_id", user!.id).maybeSingle(),
    supabase.from("orders").select("*").eq("shipper_id", user!.id).order("created_at", { ascending: false }),
  ])

  const completedOrders = orders?.filter(o => o.status === "completed") || []
  const totalSpent = completedOrders.reduce((s, o) => s + o.price, 0)

  return (
    <ShipperMypageClient
      profile={profile}
      sp={sp}
      orders={orders || []}
      completedOrders={completedOrders}
      totalSpent={totalSpent}
      userId={user!.id}
    />
  )
}
