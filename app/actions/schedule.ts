"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function postSchedule(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "인증 필요" }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (profile?.role !== "driver") return { error: "기사만 등록 가능합니다" }

  const available_date = formData.get("available_date") as string
  const origin_city    = (formData.get("origin_city") as string)?.trim()
  const origin_detail  = (formData.get("origin_detail") as string)?.trim() || null
  const dest_raw       = formData.get("dest_regions") as string
  const dest_regions   = dest_raw ? dest_raw.split(",").map(r => r.trim()).filter(Boolean) : []
  const vehicle_type   = (formData.get("vehicle_type") as string)?.trim() || null
  const cargo_raw      = formData.get("cargo_types") as string
  const cargo_types    = cargo_raw ? cargo_raw.split(",").map(r => r.trim()).filter(Boolean) : []
  const memo           = (formData.get("memo") as string)?.trim() || null

  if (!available_date) return { error: "날짜를 선택해주세요" }
  if (!origin_city)    return { error: "출발지를 입력해주세요" }
  if (dest_regions.length === 0) return { error: "도착 가능 지역을 1개 이상 선택해주세요" }

  const date = new Date(available_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date < today) return { error: "오늘 이후 날짜를 선택해주세요" }

  const { error } = await supabase.from("driver_schedules").insert({
    driver_id: user.id,
    available_date,
    origin_city,
    origin_detail,
    dest_regions,
    vehicle_type,
    cargo_types,
    memo,
    status: "active",
  })

  if (error) return { error: error.message }
  revalidatePath("/driver/schedule")
  revalidatePath("/shipper/dashboard")
  return { success: true }
}

export async function cancelSchedule(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "인증 필요" }

  const { error } = await supabase
    .from("driver_schedules")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("driver_id", user.id)

  if (error) return { error: error.message }
  revalidatePath("/driver/schedule")
  revalidatePath("/shipper/dashboard")
  return { success: true }
}

export async function markScheduleFilled(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "인증 필요" }

  const { error } = await supabase
    .from("driver_schedules")
    .update({ status: "filled" })
    .eq("id", id)
    .eq("driver_id", user.id)

  if (error) return { error: error.message }
  revalidatePath("/driver/schedule")
  return { success: true }
}
