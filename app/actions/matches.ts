"use server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

export async function cancelMatch(matchId: string, reason: string = "") {
  const supabase = await createClient()
  const service = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  const { data: match } = await supabase
    .from("matches")
    .select("id, order_id, driver_id, status, orders!inner(shipper_id, price, origin, destination)")
    .eq("id", matchId)
    .single()

  if (!match) return { error: "매칭을 찾을 수 없습니다" }
  if (match.driver_id !== user.id) return { error: "권한이 없습니다" }
  if (!["accepted", "in_progress"].includes(match.status)) return { error: "취소할 수 없는 상태입니다" }

  const order = match.orders as any
  const orderPrice = order?.price || 0
  const penaltyAmount = Math.floor(orderPrice * 0.2)
  const shipperId = order?.shipper_id
  const routeLabel = `${order?.origin} → ${order?.destination}`

  if (penaltyAmount > 0) {
    // Deduct from driver
    const { data: driverWallet } = await service
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle()
    const driverBalance = driverWallet?.balance || 0
    const newDriverBalance = driverBalance - penaltyAmount

    await service.from("wallets").upsert(
      { user_id: user.id, balance: newDriverBalance, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    await service.from("wallet_transactions").insert({
      user_id: user.id,
      type: "withdrawal",
      amount: -penaltyAmount,
      balance_after: newDriverBalance,
      description: `위약금 — ${routeLabel} (운임의 20%)`,
      reference_id: matchId,
      status: "completed",
    })

    // Credit shipper
    const { data: shipperWallet } = await service
      .from("wallets")
      .select("balance")
      .eq("user_id", shipperId)
      .maybeSingle()
    const shipperBalance = shipperWallet?.balance || 0
    const newShipperBalance = shipperBalance + penaltyAmount

    await service.from("wallets").upsert(
      { user_id: shipperId, balance: newShipperBalance, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    await service.from("wallet_transactions").insert({
      user_id: shipperId,
      type: "deposit",
      amount: penaltyAmount,
      balance_after: newShipperBalance,
      description: `위약금 수령 — 기사 취소 (${routeLabel})`,
      reference_id: matchId,
      status: "completed",
    })
  }

  await service.from("matches").update({
    status: "cancelled",
    cancelled_by: "driver",
    cancelled_at: new Date().toISOString(),
    cancel_reason: reason || null,
    penalty_amount: penaltyAmount,
  }).eq("id", matchId)

  await service.from("orders").update({ status: "pending" }).eq("id", match.order_id)

  await service.from("notifications").insert([
    {
      user_id: user.id,
      title: "운송 취소 완료",
      body: `${routeLabel} 취소. 위약금 ${penaltyAmount.toLocaleString()}원 부과.`,
      type: "match_cancelled",
      reference_id: matchId,
    },
    {
      user_id: shipperId,
      title: "기사 취소 알림",
      body: `기사가 ${routeLabel} 운송을 취소했습니다. 위약금 ${penaltyAmount.toLocaleString()}원 지급.`,
      type: "match_cancelled",
      reference_id: matchId,
    },
  ])

  revalidatePath("/driver/matches")
  revalidatePath("/driver/dashboard")
  revalidatePath("/driver/wallet")
  revalidatePath("/shipper/dashboard")
  revalidatePath("/shipper/wallet")

  return { success: true, penaltyAmount }
}
