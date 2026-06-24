"use server"
import { createServiceClient } from "@/lib/supabase/service"

function formatKoreanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith("0") ? "+82" + digits.slice(1) : digits
}

export async function sendPhoneOtp(phone: string) {
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return { error: "올바른 휴대폰 번호를 입력해주세요" }
  }

  const service = createServiceClient()
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  // 기존 OTP 삭제 후 새로 저장
  await service.from("phone_otps").delete().eq("phone", phone)
  const { error: insertError } = await service.from("phone_otps").insert({
    phone,
    code,
    expires_at: expiresAt,
  })
  if (insertError) return { error: "오류가 발생했습니다. 다시 시도해주세요." }

  // SMS 전송
  const smsKey = process.env.SMS_API_KEY
  const smsSenderId = process.env.SMS_SENDER_ID

  if (!smsKey) {
    // 개발 모드: 콘솔에 코드 출력
    console.log(`[DEV] Phone OTP for ${phone}: ${code}`)
    return { success: true, devCode: process.env.NODE_ENV === "development" ? code : undefined }
  }

  // TODO: SMS 제공사 API 호출 (NHN Cloud, SENS, Aligo 등)
  // 예: NHN Cloud SMS
  // const res = await fetch("https://api-sms.cloud.toast.com/sms/v3.0/...", {
  //   method: "POST",
  //   headers: { "X-Secret-Key": smsKey, "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     body: `[탁카] 인증번호 ${code}를 입력해주세요. (5분 이내 유효)`,
  //     sendNo: smsSenderId,
  //     recipientList: [{ recipientNo: formatKoreanPhone(phone) }],
  //   }),
  // })

  return { success: true }
}

export async function verifyPhoneOtp(phone: string, code: string) {
  if (!code || code.length !== 6) {
    return { error: "6자리 인증번호를 입력해주세요" }
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from("phone_otps")
    .select("*")
    .eq("phone", phone)
    .eq("code", code.trim())
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return { error: "인증번호가 올바르지 않거나 만료되었습니다. 다시 요청해주세요." }
  }

  // 사용된 OTP 삭제
  await service.from("phone_otps").delete().eq("id", data.id)

  return { success: true }
}
