"use server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { redirect } from "next/navigation"
import type { UserRole } from "@/lib/types"

const SPECIAL_CHAR_RE = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/~`]/
const PHONE_RE = /^01[0-9]\d{7,8}$/

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const service = createServiceClient()

  const email = (formData.get("email") as string).trim().toLowerCase()
  const password = formData.get("password") as string
  const name = (formData.get("name") as string).trim()
  const phone = (formData.get("phone") as string).replace(/-/g, "").trim()
  const role = formData.get("role") as UserRole

  if (!email || !password || !name || !phone) return { error: "모든 필수 항목을 입력해주세요" }
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다" }
  if (!SPECIAL_CHAR_RE.test(password)) return { error: "비밀번호에 특수문자를 1개 이상 포함해야 합니다" }
  if (!PHONE_RE.test(phone)) return { error: "올바른 휴대폰 번호를 입력해주세요 (예: 010-1234-5678)" }

  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: { name, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (error) return { error: error.message }
  if (!data.user) return { error: "회원가입 실패" }

  const { error: profileError } = await service
    .from("users")
    .insert({
      id: data.user.id,
      email,
      name,
      phone,
      role,
      status: "active",
      verification_status: "unverified",
    })
  if (profileError) return { error: profileError.message }

  if (role === "driver") {
    await service.from("driver_profiles").insert({
      user_id: data.user.id,
      vehicle_number: "",
      vehicle_type: "",
      is_verified: false,
      rating_avg: 0,
      rating_count: 0,
    })
  } else if (role === "shipper") {
    await service.from("shipper_profiles").insert({ user_id: data.user.id })
  }

  if (!data.session) {
    return { redirect: `/verify-email?email=${encodeURIComponent(email)}` }
  }
  return { redirect: "/verification" }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get("email") as string).trim().toLowerCase()
  const password = formData.get("password") as string

  if (!email || !password) return { error: "이메일과 비밀번호를 입력해주세요" }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (error.message === "Invalid login credentials") return { error: "이메일 또는 비밀번호가 올바르지 않습니다" }
    if (error.message.includes("Email not confirmed")) return { error: "이메일 인증을 완료해주세요. 메일함을 확인하세요." }
    return { error: error.message }
  }

  const user = data.user
  if (!user) return { error: "로그인 실패" }

  const { data: profile } = await supabase
    .from("users")
    .select("role, verification_status")
    .eq("id", user.id)
    .single()

  if (!profile) return { redirect: "/onboarding" }

  // Unverified users go to KYC
  if (profile.verification_status !== "verified") {
    return { redirect: "/verification" }
  }

  if (profile.role === "shipper") return { redirect: "/shipper/dashboard" }
  if (profile.role === "driver") return { redirect: "/driver/dashboard" }
  if (profile.role === "admin") return { redirect: "/admin/dashboard" }
  return { redirect: "/" }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
