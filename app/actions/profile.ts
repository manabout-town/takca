"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const PHONE_RE = /^01[0-9]\d{7,8}$/
const PW_SPECIAL_RE = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/~`]/

function revalidateMypage() {
  revalidatePath("/shipper/mypage")
  revalidatePath("/driver/mypage")
}

export async function updateBasicInfo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "인증 필요" }

  const name     = (formData.get("name") as string)?.trim()
  const nickname = (formData.get("nickname") as string)?.trim() || null
  const phone    = (formData.get("phone") as string)?.replace(/-/g, "").trim()

  if (!name) return { error: "이름을 입력해주세요" }
  if (name.length > 20) return { error: "이름은 20자 이하여야 합니다" }
  if (nickname && nickname.length > 15) return { error: "별명은 15자 이하여야 합니다" }
  if (phone && !PHONE_RE.test(phone)) return { error: "올바른 휴대폰 번호를 입력해주세요 (예: 01012345678)" }

  const { error } = await supabase
    .from("users")
    .update({ name, nickname, phone: phone || null })
    .eq("id", user.id)

  if (error) return { error: error.message }
  revalidateMypage()
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "인증 필요" }

  const newPassword     = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!newPassword || newPassword.length < 8)
    return { error: "비밀번호는 8자 이상이어야 합니다" }
  if (!PW_SPECIAL_RE.test(newPassword))
    return { error: "특수문자를 1개 이상 포함해야 합니다" }
  if (newPassword !== confirmPassword)
    return { error: "비밀번호가 일치하지 않습니다" }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateAvatarUrl(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "인증 필요" }

  const { error } = await supabase
    .from("users")
    .update({ avatar_url: url })
    .eq("id", user.id)

  if (error) return { error: error.message }
  revalidateMypage()
  return { success: true }
}

export async function updateVehicle(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "인증 필요" }

  const vehicleNumber   = (formData.get("vehicleNumber") as string)?.trim()
  const vehicleType     = (formData.get("vehicleType") as string)?.trim()
  const homeRegion      = (formData.get("homeRegion") as string)?.trim() || null
  const routeRegionsRaw = (formData.get("routeRegions") as string) || ""
  const routeRegions    = routeRegionsRaw
    .split(",")
    .map(r => r.trim())
    .filter(Boolean)

  if (!vehicleNumber) return { error: "차량번호를 입력해주세요" }
  if (!vehicleType)   return { error: "차량 종류를 선택해주세요" }

  const { error } = await supabase
    .from("driver_profiles")
    .update({ vehicle_number: vehicleNumber, vehicle_type: vehicleType, home_region: homeRegion, route_regions: routeRegions })
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  revalidatePath("/driver/mypage")
  return { success: true }
}

export async function updateLicenseDocUrl(path: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "인증 필요" }

  const { error } = await supabase
    .from("driver_profiles")
    .update({ license_doc_url: path })
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  revalidatePath("/driver/mypage")
  return { success: true }
}

export async function updateShipperProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "인증 필요" }

  const companyName    = (formData.get("companyName") as string)?.trim() || null
  const businessNumber = (formData.get("businessNumber") as string)?.trim() || null

  const { error } = await supabase
    .from("shipper_profiles")
    .update({ company_name: companyName, business_number: businessNumber })
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  revalidatePath("/shipper/mypage")
  return { success: true }
}

export async function updateBusinessDocUrl(path: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "인증 필요" }

  const { error } = await supabase
    .from("shipper_profiles")
    .update({ business_doc_url: path })
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  revalidatePath("/shipper/mypage")
  return { success: true }
}
