"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signUp } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { VEHICLE_TYPES } from "@/lib/types"
import { Logo } from "@/components/shared/Logo"

type Provider = "kakao" | "google" | "apple"

const SPECIAL_CHAR_RE = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/~`]/
const PHONE_RE = /^01[0-9]\d{7,8}$/

const REGIONS = [
  "서울","경기","인천","강원","충북","충남","대전","세종",
  "전북","전남","광주","경북","경남","대구","울산","부산","제주"
]

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (SPECIAL_CHAR_RE.test(pw)) score++
  if (score <= 1) return { score, label: "매우 약함", color: "bg-red-400" }
  if (score === 2) return { score, label: "약함", color: "bg-orange-400" }
  if (score === 3) return { score, label: "보통", color: "bg-amber-400" }
  if (score === 4) return { score, label: "강함", color: "bg-emerald-500" }
  return { score, label: "매우 강함", color: "bg-emerald-600" }
}

function SignupForm() {
  const params = useSearchParams()
  const [role, setRole] = useState<"shipper" | "driver">(
    (params.get("role") as "shipper" | "driver") || "shipper"
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<Provider | null>(null)
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([])

  function toggleRoute(region: string) {
    setSelectedRoutes(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    )
  }

  function validateForm(formData: FormData): boolean {
    const errors: Record<string, string> = {}
    const pw = formData.get("password") as string
    const phone = formData.get("phone") as string
    if (pw.length < 8) errors.password = "비밀번호는 8자 이상이어야 합니다"
    else if (!SPECIAL_CHAR_RE.test(pw)) errors.password = "특수문자를 1개 이상 포함해야 합니다"
    else if (pw !== passwordConfirm) errors.passwordConfirm = "비밀번호가 일치하지 않습니다"
    if (!PHONE_RE.test(phone.replace(/-/g, ""))) errors.phone = "올바른 휴대폰 번호를 입력해주세요"
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSocial(provider: Provider) {
    setSocialLoading(provider)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    })
    setSocialLoading(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("role", role)
    formData.set("routeRegions", JSON.stringify(selectedRoutes))
    if (!validateForm(formData)) return
    setLoading(true)
    const result = await signUp(formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  const strength = password ? passwordStrength(password) : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6"><Logo size="lg" /></div>
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
        </div>

        <div className="flex gap-1.5 mb-6 p-1.5 bg-gray-100 rounded-xl">
          {(["shipper", "driver"] as const).map(r => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {r === "shipper" ? "🏢 화주" : "🚛 기사"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}

          {/* 소셜 가입 */}
          <div className="space-y-2.5 mb-5">
            <button type="button" onClick={() => handleSocial("kakao")} disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-[#FEE500] hover:bg-[#F0D800] text-[#191919] font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-60">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M9 1C4.582 1 1 3.896 1 7.455c0 2.272 1.52 4.267 3.818 5.394L3.91 16.06a.2.2 0 00.296.215L8.42 13.86c.189.014.38.022.58.022 4.418 0 8-2.896 8-6.427C17 3.896 13.418 1 9 1z" fill="#191919"/>
              </svg>
              {socialLoading === "kakao" ? "연결 중..." : "카카오로 시작하기"}
            </button>
            <button type="button" onClick={() => handleSocial("google")} disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm py-3 rounded-xl border border-gray-200 transition-colors disabled:opacity-60">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.705A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.705V4.963H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.037l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.963L3.964 7.295C4.672 5.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {socialLoading === "google" ? "연결 중..." : "구글로 시작하기"}
            </button>
            <button type="button" onClick={() => handleSocial("apple")} disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-black hover:bg-gray-900 text-white font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-60">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M13.117 9.57c-.02-2.107 1.72-3.12 1.8-3.172-.978-1.43-2.5-1.626-3.048-1.647-1.3-.131-2.54.764-3.198.764-.66 0-1.677-.746-2.76-.727-1.42.02-2.73.824-3.46 2.1-1.477 2.56-.38 6.356 1.062 8.434.703 1.018 1.542 2.16 2.641 2.12 1.06-.042 1.46-.683 2.742-.683 1.282 0 1.64.683 2.76.66 1.14-.02 1.86-1.038 2.558-2.059.806-1.18 1.138-2.322 1.158-2.38-.025-.01-2.218-.85-2.238-3.37h.002z" fill="white"/>
                <path d="M10.98 2.795c.582-.706.976-1.688.868-2.665-.84.034-1.858.56-2.46 1.265-.54.623-1.014 1.622-.888 2.578.936.072 1.898-.475 2.48-1.178z" fill="white"/>
              </svg>
              {socialLoading === "apple" ? "연결 중..." : "Apple로 시작하기"}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">또는 이메일로 가입</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" label="이름" placeholder="홍길동" required />
            <Input name="email" type="email" label="이메일" placeholder="name@example.com"
              hint="가입 후 이메일 인증이 필요합니다" autoComplete="email" required />
            <Input name="phone" type="tel" label="휴대폰 번호" placeholder="010-1234-5678"
              error={fieldErrors.phone} required />

            <div className="space-y-2">
              <Input name="password" type="password" label="비밀번호"
                placeholder="8자 이상, 특수문자 포함"
                value={password} onChange={e => setPassword(e.target.value)}
                error={fieldErrors.password} autoComplete="new-password" required />
              {password && strength && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength.score ? strength.color : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>강도: <span className="font-medium text-gray-700">{strength.label}</span></span>
                    <div className="flex gap-2">
                      <span className={password.length >= 8 ? "text-emerald-600" : ""}>8자+</span>
                      <span className={SPECIAL_CHAR_RE.test(password) ? "text-emerald-600" : ""}>특수문자</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Input name="passwordConfirm" type="password" label="비밀번호 확인"
                placeholder="비밀번호 재입력"
                value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                error={fieldErrors.passwordConfirm} autoComplete="new-password" required />
              {passwordConfirm && password === passwordConfirm && !fieldErrors.passwordConfirm && (
                <p className="mt-1 text-xs text-emerald-600">✓ 일치합니다</p>
              )}
            </div>

            {role === "driver" && (
              <>
                <Input name="vehicleNumber" label="차량번호" placeholder="12가 3456" required />
                <Select name="vehicleType" label="차량 종류"
                  options={VEHICLE_TYPES.map(v => ({ value: v, label: v }))}
                  placeholder="차량 종류 선택" required />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">거주지 (활동 지역)</label>
                  <Select name="homeRegion" label=""
                    options={REGIONS.map(r => ({ value: r, label: r }))}
                    placeholder="거주지 선택" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주요 운송 루트 (복수 선택)</label>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map(region => (
                      <button key={region} type="button" onClick={() => toggleRoute(region)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          selectedRoutes.includes(region)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                        }`}>
                        {region}
                      </button>
                    ))}
                  </div>
                  {selectedRoutes.length === 0 && (
                    <p className="mt-1 text-xs text-gray-400">운행 가능한 지역을 선택하세요</p>
                  )}
                </div>
              </>
            )}

            <div className="pt-1">
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                {role === "shipper" ? "화주로 가입하기" : "기사로 가입하기"}
              </Button>
            </div>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-gray-900 font-semibold hover:underline">로그인</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400 text-sm">로딩 중...</div></div>}>
      <SignupForm />
    </Suspense>
  )
}
