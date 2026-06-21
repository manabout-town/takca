"use server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { redirect } from "next/navigation"
import type { UserRole } from "@/lib/types"

const PHONE_RE = /^01[0-9]\d{7,8}$/

export async function completeProfile(formData: FormData) {
  const supabase = await createClient()
  const service = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  const name = (formData.get("name") as string).trim()
  const phone = (formData.get("phone") as string).replace(/-/g, "").trim()
  const role = formData.get("role") as UserRole
  const vehicleNumber = (formData.get("vehicleNumber") as string)?.trim()
  const vehicleType = formData.get("vehicleType") as string
  const homeRegion = formData.get("homeRegion") as string
  const routeRegionsRaw = formData.get("routeRegions") as string
  const routeRegions = routeRegionsRaw ? JSON.parse(routeRegionsRaw) : []
  const companyName = (formData.get("companyName") as string)?.trim() || null
  const businessType = (formData.get("businessType") as string) || null
  const businessNumber = (formData.get("businessNumber") as string)?.replace(/-/g, "").trim() || null

  if (!name || !phone || !role) return { error: "모든 필수 항목을 입력해주세요" }
  if (!PHONE_RE.test(phone)) return { error: "올바른 휴대폰 번호를 입력해주세요 (예: 01012345678)" }
  if (role === "driver" && (!vehicleNumber || !vehicleType)) return { error: "차량 정보를 입력해주세요" }

  const { error: upsertError } = await service
    .from("users")
    .upsert({ id: user.id, email: user.email!, name, phone, role, status: "active" })
  if (upsertError) return { error: upsertError.message }

  if (role === "driver") {
    await service.from("driver_profiles").upsert({
      user_id: user.id,
      vehicle_number: vehicleNumber,
      vehicle_type: vehicleType,
      home_region: homeRegion || null,
      route_regions: routeRegions,
      is_verified: false,
      rating_avg: 0,
      rating_count: 0,
    })
  } else {
    await service.from("shipper_profiles").upsert({
      user_id: user.id,
      company_name: companyName,
      business_number: businessNumber,
    })
  }

  await service.from("wallets").upsert({ user_id: user.id, balance: 0 })

  redirect(role === "driver" ? "/driver/dashboard" : "/shipper/dashboard")
}
