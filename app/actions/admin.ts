"use server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function resolveDispute(
  disputeId: string,
  resolution: "driver_win" | "shipper_win" | "partial_refund"
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: adminCheck } = await supabase
    .from("users").select("role").eq("id", user.id).single()
  if (adminCheck?.role !== "admin") return { error: "Admin only" }

  const service = createServiceClient()

  const { data: dispute } = await service
    .from("disputes")
    .select("*, matches(id, order_id, driver_id, orders(id, shipper_id, price))")
    .eq("id", disputeId)
    .single()

  if (!dispute) return { error: "Dispute not found" }

  const match = dispute.matches as any
  const order = match?.orders

  // Update dispute
  await service.from("disputes").update({
    status: "resolved",
    resolution,
    resolved_at: new Date().toISOString(),
  }).eq("id", disputeId)

  // Handle escrow based on resolution
  if (resolution === "driver_win") {
    await service.from("escrow").update({
      status: "released",
      released_at: new Date().toISOString(),
    }).eq("match_id", match.id)

    const totalAmount = order?.price || 0
    const platformFee = Math.floor(totalAmount * 0.04)
    const driverPayout = totalAmount - platformFee

    const { data: escrow } = await service
      .from("escrow").select("id").eq("match_id", match.id).single()

    if (escrow) {
      await service.from("payouts").insert({
        escrow_id: escrow.id,
        driver_id: match.driver_id,
        amount: driverPayout,
        status: "pending",
      })
    }

    await service.from("orders").update({ status: "completed" }).eq("id", order.id)
    await service.from("matches").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", match.id)
  } else if (resolution === "shipper_win") {
    await service.from("escrow").update({
      status: "refunded",
      released_at: new Date().toISOString(),
    }).eq("match_id", match.id)

    await service.from("orders").update({ status: "cancelled" }).eq("id", order.id)
    await service.from("matches").update({ status: "cancelled" }).eq("id", match.id)
  } else {
    // partial_refund: driver gets 50% of payout
    const totalAmount = order?.price || 0
    const platformFee = Math.floor(totalAmount * 0.04)
    const fullDriverPayout = totalAmount - platformFee
    const splitPayout = Math.floor(fullDriverPayout * 0.5)

    await service.from("escrow").update({
      status: "released",
      released_at: new Date().toISOString(),
    }).eq("match_id", match.id)

    const { data: escrow } = await service
      .from("escrow").select("id").eq("match_id", match.id).single()

    if (escrow) {
      await service.from("payouts").insert({
        escrow_id: escrow.id,
        driver_id: match.driver_id,
        amount: splitPayout,
        status: "pending",
      })
    }

    await service.from("matches").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", match.id)

    await service.from("orders").update({ status: "completed" }).eq("id", order.id)
  }

  revalidatePath("/admin/disputes")
  redirect("/admin/disputes")
}

export async function approveWithdrawal(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: adminCheck } = await supabase
    .from("users").select("role").eq("id", user.id).single()
  if (adminCheck?.role !== "admin") return { error: "Admin only" }

  const service = createServiceClient()
  await service.from("withdrawal_requests").update({
    status: "completed",
    processed_at: new Date().toISOString(),
  }).eq("id", requestId).eq("status", "pending")

  await service.from("wallet_transactions").update({ status: "completed" })
    .eq("reference_id", requestId)

  revalidatePath("/admin/withdrawals")
  return { success: true }
}

export async function rejectWithdrawal(requestId: string, reason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: adminCheck } = await supabase
    .from("users").select("role").eq("id", user.id).single()
  if (adminCheck?.role !== "admin") return { error: "Admin only" }

  const service = createServiceClient()

  const { data: req } = await service
    .from("withdrawal_requests").select("*").eq("id", requestId).eq("status", "pending").single()
  if (!req) return { error: "요청을 찾을 수 없거나 이미 처리되었습니다" }

  // Restore balance
  const { data: wallet } = await service
    .from("wallets").select("balance").eq("user_id", req.user_id).single()
  const restoredBalance = (wallet?.balance || 0) + req.amount

  await service.from("wallets").update({
    balance: restoredBalance,
    updated_at: new Date().toISOString(),
  }).eq("user_id", req.user_id)

  await service.from("wallet_transactions").insert({
    user_id: req.user_id,
    type: "deposit",
    amount: req.amount,
    balance_after: restoredBalance,
    description: `출금 거절 — 잔액 복구${reason ? ` (${reason})` : ""}`,
    status: "completed",
  })

  await service.from("wallet_transactions").update({ status: "failed" })
    .eq("reference_id", requestId)

  await service.from("withdrawal_requests").update({
    status: "rejected",
    rejected_reason: reason || null,
    processed_at: new Date().toISOString(),
  }).eq("id", requestId)

  revalidatePath("/admin/withdrawals")
  return { success: true }
}

export async function suspendUser(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: adminCheck } = await supabase
    .from("users").select("role").eq("id", user.id).single()
  if (adminCheck?.role !== "admin") return { error: "Admin only" }

  const service = createServiceClient()
  await service.from("users").update({ status: "suspended" }).eq("id", userId)
  revalidatePath("/admin/users")
}
