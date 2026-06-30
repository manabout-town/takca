"use server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith("0") ? "+82" + digits.slice(1) : "+" + digits
}

export async function sendPhoneOtp(phone: string) {
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return { error: "올바른 휴대폰 번호를 입력해주세요" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    phone: toE164(phone),
  })

  if (error) {
    if (error.message.toLowerCase().includes("rate")) return { error: "잠시 후 다시 시도해주세요" }
    return { error: "인증번호 발송에 실패했습니다. 번호를 확인해주세요." }
  }

  return { success: true }
}

export async function verifyPhoneOtp(phone: string, code: string) {
  if (!code || code.length !== 6) {
    return { error: "6자리 인증번호를 입력해주세요" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({
    phone: toE164(phone),
    token: code.trim(),
    type: "sms",
  })

  if (error) {
    return { error: "인증번호가 올바르지 않거나 만료되었습니다. 다시 요청해주세요." }
  }

  // 검증용으로 생성된 임시 phone-only 계정 정리
  if (data.user) {
    const service = createServiceClient()
    await supabase.auth.signOut()
    await service.auth.admin.deleteUser(data.user.id)
  }

  return { success: true }
}
