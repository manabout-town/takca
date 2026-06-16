import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

// 72시간 자동 에스크로 해제 (cron job용)
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const service = createServiceClient()
  const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()

  // Find matches where completion was requested > 72h ago but shipper hasn't confirmed
  const { data: expiredMatches } = await service
    .from("matches")
    .select("id, driver_id, order_id, orders(price)")
    .not("completion_requested_at", "is", null)
    .lt("completion_requested_at", cutoff)
    .eq("status", "in_progress")

  if (!expiredMatches?.length) {
    return NextResponse.json({ released: 0 })
  }

  const matchIds = expiredMatches.map((m) => m.id)
  const { data: heldEscrows } = await service
    .from("escrow")
    .select("id, match_id")
    .in("match_id", matchIds)
    .eq("status", "held")

  if (!heldEscrows?.length) {
    return NextResponse.json({ released: 0 })
  }

  const escrowByMatchId = Object.fromEntries(heldEscrows.map((e) => [e.match_id, e]))

  let released = 0
  for (const match of expiredMatches) {
    const escrow = escrowByMatchId[match.id]
    if (!escrow) continue

    const totalAmount = (match.orders as any)?.price || 0
    const platformFee = Math.floor(totalAmount * 0.04)
    const driverPayout = totalAmount - platformFee

    await service.from("escrow").update({
      status: "released",
      released_at: new Date().toISOString(),
    }).eq("id", escrow.id)

    await service.from("payouts").insert({
      escrow_id: escrow.id,
      driver_id: match.driver_id,
      amount: driverPayout,
      status: "pending",
    })

    await service.from("matches").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", match.id)

    await service.from("orders").update({ status: "completed" }).eq("id", match.order_id)
    released++
  }

  return NextResponse.json({ released })
}
