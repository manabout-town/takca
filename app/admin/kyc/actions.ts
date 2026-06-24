"use server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

export async function approveKYC(submissionId: string): Promise<void> {
  const service = createServiceClient()

  const { data: submission } = await service
    .from("kyc_submissions")
    .select("user_id")
    .eq("id", submissionId)
    .single()

  if (!submission) return

  await service
    .from("kyc_submissions")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", submissionId)

  await service
    .from("users")
    .update({ verification_status: "verified" })
    .eq("id", submission.user_id)

  revalidatePath("/admin/kyc")
}

export async function rejectKYC(submissionId: string, reason: string): Promise<void> {
  const service = createServiceClient()

  const { data: submission } = await service
    .from("kyc_submissions")
    .select("user_id")
    .eq("id", submissionId)
    .single()

  if (!submission) return

  await service
    .from("kyc_submissions")
    .update({
      status: "rejected",
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId)

  await service
    .from("users")
    .update({ verification_status: "rejected" })
    .eq("id", submission.user_id)

  revalidatePath("/admin/kyc")
}
