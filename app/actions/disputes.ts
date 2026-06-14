"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitDispute(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  const matchId = formData.get("matchId") as string
  const reason = formData.get("reason") as string

  if (!reason?.trim()) return { error: "신고 사유를 입력해주세요" }

  const { data: escrow } = await supabase
    .from("escrow")
    .select("id")
    .eq("match_id", matchId)
    .single()

  const { error } = await supabase.from("disputes").insert({
    match_id: matchId,
    escrow_id: escrow?.id || null,
    raised_by: user.id,
    reason: reason.trim(),
    status: "open",
  })

  if (error) return { error: error.message }

  await supabase.from("orders")
    .update({ status: "disputed" })
    .eq("id", (await supabase.from("matches").select("order_id").eq("id", matchId).single()).data?.order_id)

  revalidatePath(`/chat/${matchId}`)
  return { success: true }
}
