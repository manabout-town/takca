"use server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

export async function claimOrder(orderId: string) {
  const supabase = await createClient()
  const service = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  // 선착순 — pending 상태인지 재확인
  const { data: order } = await service
    .from("orders")
    .select("id, status, price")
    .eq("id", orderId)
    .single()

  if (!order) return { error: "의뢰를 찾을 수 없습니다" }
  if (order.status !== "pending") return { error: "이미 수락된 의뢰입니다" }

  const { error: matchError } = await service.from("matches").insert({
    order_id: orderId,
    driver_id: user.id,
    status: "accepted",
    matched_at: new Date().toISOString(),
  })
  if (matchError) return { error: matchError.message }

  await service.from("orders").update({ status: "matched" }).eq("id", orderId)

  revalidatePath("/driver/dashboard")
  revalidatePath("/driver/matches")
  return { success: true }
}
