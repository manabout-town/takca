"use server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

export async function markPayoutPaid(payoutId: string) {
  const service = createServiceClient()

  const { error } = await service
    .from("payouts")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", payoutId)
    .eq("status", "pending")

  if (error) return { error: "정산 처리 중 오류가 발생했습니다" }

  revalidatePath("/admin/settlements")
  return { success: true }
}
