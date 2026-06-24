"use server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

export interface ChecklistData {
  exterior_ok: boolean
  glass_ok: boolean
  tires_ok: boolean
  interior_ok: boolean
  engine_ok: boolean
  mileage: number | null
}

export interface PhotoData {
  url: string
  caption: string
}

export async function submitConditionReport(
  matchId: string,
  type: "pickup" | "delivery",
  photos: PhotoData[],
  checklist: ChecklistData,
  notes: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  // Verify caller is part of this match
  const { data: match } = await supabase
    .from("matches")
    .select("id, driver_id, order_id, orders!inner(shipper_id)")
    .eq("id", matchId)
    .single()

  if (!match) return { error: "매칭을 찾을 수 없습니다" }

  const order = match.orders as any
  const isDriver = match.driver_id === user.id
  const isShipper = order?.shipper_id === user.id

  if (!isDriver && !isShipper) return { error: "권한이 없습니다" }

  // Only driver can submit condition reports
  if (!isDriver) return { error: "기사만 차량 상태 리포트를 제출할 수 있습니다" }

  // Check for duplicate
  const { data: existing } = await supabase
    .from("condition_reports")
    .select("id")
    .eq("match_id", matchId)
    .eq("type", type)
    .maybeSingle()

  if (existing) return { error: `이미 ${type === "pickup" ? "픽업" : "인도"} 리포트를 제출했습니다` }

  const service = createServiceClient()
  const { data, error } = await service
    .from("condition_reports")
    .insert({
      match_id: matchId,
      type,
      photos,
      checklist,
      notes: notes.trim() || null,
      submitted_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/chat/${matchId}`)
  revalidatePath(`/driver/matches`)
  revalidatePath(`/shipper/orders/${match.order_id}`)

  return { success: true, report: data }
}

export async function confirmConditionReport(reportId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  // Verify the caller is the shipper of this match
  const { data: report } = await supabase
    .from("condition_reports")
    .select("id, match_id, shipper_confirmed, matches!inner(order_id, orders!inner(shipper_id))")
    .eq("id", reportId)
    .single()

  if (!report) return { error: "리포트를 찾을 수 없습니다" }
  if (report.shipper_confirmed) return { error: "이미 확인된 리포트입니다" }

  const match = report.matches as any
  const order = match?.orders as any
  if (order?.shipper_id !== user.id) return { error: "권한이 없습니다" }

  const service = createServiceClient()
  const { error } = await service
    .from("condition_reports")
    .update({ shipper_confirmed: true })
    .eq("id", reportId)

  if (error) return { error: error.message }

  revalidatePath(`/chat/${report.match_id}`)
  revalidatePath(`/shipper/orders/${match.order_id}`)

  return { success: true }
}
