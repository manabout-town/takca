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
    .select("*, matches(id, driver_id, orders(shipper_id, price))")
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
    // partial_refund: 50/50
    await service.from("escrow").update({
      status: "released",
      released_at: new Date().toISOString(),
    }).eq("match_id", match.id)

    await service.from("orders").update({ status: "completed" }).eq("id", order.id)
  }

  revalidatePath("/admin/disputes")
  redirect("/admin/disputes")
}

export async function suspendUser(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const service = createServiceClient()
  await service.from("users").update({ status: "suspended" }).eq("id", userId)
  revalidatePath("/admin/users")
}
