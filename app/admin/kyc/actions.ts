"use server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

export async function approveKYC(submissionId: string) {
  const service = createServiceClient()

  const { data: submission, error } = await service
    .from("kyc_submissions")
    .select("user_id")
    .eq("id", submissionId)
    .single()

  if (error || !submission) return { error: "제출 내역을 찾을 수 없습니다" }

  await service
    .from("kyc_submissions")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", submissionId)

  await service
    .from("users")
    .update({ verification_status: "verified" })
    .eq("id", submission.user_id)

  revalidatePath("/admin/kyc")
  return { success: true }
}

export async function rejectKYC(submissionId: string, reason: string) {
  const service = createServiceClient()

  const { data: submission, error } = await service
    .from("kyc_submissions")
    .select("user_id")
    .eq("id", submissionId)
    .single()

  if (error || !submission) return { error: "제출 내역을 찾을 수 없습니다" }

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
  return { success: true }
}
