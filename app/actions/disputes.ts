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

  // Verify user is a participant in this match
  const { data: match } = await supabase
    .from("matches")
    .select("order_id, driver_id, orders!inner(shipper_id)")
    .eq("id", matchId)
    .single()

  if (!match) return { error: "매칭을 찾을 수 없습니다" }
  const isParticipant = match.driver_id === user.id || (match.orders as any)?.shipper_id === user.id
  if (!isParticipant) return { error: "권한이 없습니다" }

  const { data: escrow } = await supabase
    .from("escrow")
    .select("id")
    .eq("match_id", matchId)
    .maybeSingle()

  const { error } = await supabase.from("disputes").insert({
    match_id: matchId,
    escrow_id: escrow?.id || null,
    raised_by: user.id,
    reason: reason.trim(),
    status: "open",
  })

  if (error) return { error: error.message }

  await supabase.from("orders").update({ status: "disputed" }).eq("id", match.order_id)

  revalidatePath(`/chat/${matchId}`)
  return { success: true }
}
