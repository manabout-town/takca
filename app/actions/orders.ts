"use server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  const origin = formData.get("origin") as string
  const destination = formData.get("destination") as string
  const cargoType = formData.get("cargoType") as string
  const cargoDetail = formData.get("cargoDetail") as string
  const price = parseInt(formData.get("price") as string)
  const pickupAt = formData.get("pickupAt") as string
  const title = formData.get("title") as string
  const vehicleType = formData.get("vehicleType") as string
  const isUrgent = formData.get("isUrgent") === "true"
  const urgentFee = isUrgent ? 1000 : 0

  const { data, error } = await supabase.from("orders").insert({
    shipper_id: user.id,
    origin,
    destination,
    cargo_type: cargoType,
    cargo_detail: cargoDetail,
    price,
    pickup_at: pickupAt,
    title,
    vehicle_type: vehicleType,
    is_urgent: isUrgent,
    urgent_fee: urgentFee,
    status: "pending",
  }).select().single()

  if (error) return { error: error.message }

  revalidatePath("/shipper/dashboard")
  revalidatePath("/driver/feed")
  redirect(`/shipper/orders/${data.id}`)
}

export async function acceptOrder(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  // Check order is still pending
  const { data: order } = await supabase
    .from("orders")
    .select("status, shipper_id")
    .eq("id", orderId)
    .single()

  if (!order) return { error: "의뢰를 찾을 수 없습니다" }
  if (order.status !== "pending") return { error: "이미 매칭된 의뢰입니다" }
  if (order.shipper_id === user.id) return { error: "본인의 의뢰는 수락할 수 없습니다" }

  // Create match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      order_id: orderId,
      driver_id: user.id,
      status: "accepted",
      matched_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (matchError) return { error: matchError.message }

  // Update order status
  await supabase
    .from("orders")
    .update({ status: "matched" })
    .eq("id", orderId)

  revalidatePath("/driver/feed")
  revalidatePath(`/driver/matches/${match.id}`)
  redirect(`/chat/${match.id}`)
}

export async function confirmStart(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  await supabase.from("matches").update({ status: "in_progress" }).eq("id", matchId)
  await supabase.from("orders")
    .update({ status: "in_progress" })
    .eq("id", (await supabase.from("matches").select("order_id").eq("id", matchId).single()).data?.order_id)

  revalidatePath(`/chat/${matchId}`)
  return { success: true }
}

export async function requestCompletion(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  // Mark as completion requested via chat system message
  const { data: match } = await supabase
    .from("matches")
    .select("order_id")
    .eq("id", matchId)
    .single()

  if (!match) return { error: "매칭을 찾을 수 없습니다" }

  await supabase.from("chats").insert({
    match_id: matchId,
    sender_id: user.id,
    message: "SYSTEM:COMPLETION_REQUESTED",
    sent_at: new Date().toISOString(),
  })

  revalidatePath(`/chat/${matchId}`)
  return { success: true }
}

export async function confirmCompletion(matchId: string) {
  const supabase = await createClient()
  const service = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  const { data: match } = await supabase
    .from("matches")
    .select("order_id, driver_id, orders(price)")
    .eq("id", matchId)
    .single()

  if (!match) return { error: "매칭을 찾을 수 없습니다" }

  const totalAmount = (match.orders as any)?.price || 0
  const platformFee = Math.floor(totalAmount * 0.04)
  const driverPayout = totalAmount - platformFee

  // Complete match
  await service.from("matches").update({
    status: "completed",
    completed_at: new Date().toISOString(),
  }).eq("id", matchId)

  // Complete order
  await service.from("orders").update({ status: "completed" }).eq("id", match.order_id)

  // Release escrow
  await service.from("escrow").update({
    status: "released",
    released_at: new Date().toISOString(),
  }).eq("match_id", matchId)

  // Create payout record
  const { data: escrow } = await service
    .from("escrow")
    .select("id")
    .eq("match_id", matchId)
    .single()

  if (escrow) {
    await service.from("payouts").insert({
      escrow_id: escrow.id,
      driver_id: match.driver_id,
      amount: driverPayout,
      status: "pending",
    })
  }

  revalidatePath(`/chat/${matchId}`)
  redirect(`/review/${matchId}`)
}

export async function cancelOrder(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  const { data: order } = await supabase
    .from("orders")
    .select("shipper_id, status")
    .eq("id", orderId)
    .single()

  if (!order) return { error: "의뢰를 찾을 수 없습니다" }
  if (order.shipper_id !== user.id) return { error: "권한이 없습니다" }
  if (!["pending"].includes(order.status)) return { error: "취소할 수 없는 상태입니다" }

  await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId)

  revalidatePath("/shipper/dashboard")
  redirect("/shipper/dashboard")
}
