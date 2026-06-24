"use server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

export async function markPayoutPaid(payoutId: string): Promise<void> {
  const service = createServiceClient()

  await service
    .from("payouts")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", payoutId)
    .eq("status", "pending")

  revalidatePath("/admin/settlements")
}
