import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { DriverOrderDetailClient } from "./DriverOrderDetailClient"

export default async function DriverOrderDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: order }, { data: myBid }, { data: driverProfile }] = await Promise.all([
    supabase.from("orders").select("*, shippers:users!shipper_id(name, phone)").eq("id", params.id).single(),
    supabase.from("bids").select("*").eq("order_id", params.id).eq("driver_id", user!.id).maybeSingle(),
    supabase.from("driver_profiles").select("home_region, route_regions").eq("user_id", user!.id).maybeSingle(),
  ])

  if (!order) notFound()

  const canBid = order.status === "pending" && order.shipper_id !== user!.id

  return (
    <DriverOrderDetailClient
      order={order}
      myBid={myBid}
      canBid={canBid}
      driverProfile={driverProfile}
    />
  )
}
