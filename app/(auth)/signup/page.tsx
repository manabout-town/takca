"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signUp } from "@/app/actions/auth"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { VEHICLE_TYPES } from "@/lib/types"

const SPECIAL_CHAR_RE = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/~`]/
const PHONE_RE = /^01[0-9]\d{7,8}$/

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
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validateForm(formData: FormData): boolean {
    const errors: Record<string, string> = {}
    const pw = formData.get("password") as string
    const phone = formData.get("phone") as string

    if (pw.length < 8) errors.password = "비밀번호는 8자 이상이어야 합니다"
    else if (!SPECIAL_CHAR_RE.test(pw)) errors.password = "특수문자를 1개 이상 포함해야 합니다"
    else if (pw !== passwordConfirm) errors.passwordConfirm = "비밀번호가 일치하지 않습니다"

    if (!PHONE_RE.test(phone.replace(/-/g, ""))) {
      errors.phone = "올바른 휴대폰 번호를 입력해주세요"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("role", role)
    if (!validateForm(formData)) return
    setLoading(true)
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const strength = password ? passwordStrength(password) : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl">🚛</span>
            <span className="text-xl font-bold text-gray-900 tracking-tight">화물로</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
        </div>

        {/* Role selector */}
        <div className="flex gap-1.5 mb-6 p-1.5 bg-gray-100 rounded-xl">
          {(["shipper", "driver"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r === "shipper" ? "🏢 화주" : "🚛 기사"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" label="이름" placeholder="홍길동" required />
            <Input name="email" type="email" label="이메일" placeholder="name@example.com" hint="가입 후 이메일 인증이 필요합니다" autoComplete="email" required />
            <Input name="phone" type="tel" label="휴대폰 번호" placeholder="010-1234-5678" error={fieldErrors.phone} required />

            {/* Password */}
            <div className="space-y-2">
              <Input
                name="password" type="password" label="비밀번호"
                placeholder="8자 이상, 특수문자 포함"
                value={password} onChange={e => setPassword(e.target.value)}
                error={fieldErrors.password} autoComplete="new-password" required
              />
              {password && strength && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength.score ? strength.color : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">강도: <span className="font-medium text-gray-700">{strength.label}</span></span>
                    <div className="flex gap-2 text-gray-400">
                      <span className={password.length >= 8 ? "text-emerald-600" : ""}>8자+</span>
                      <span className={SPECIAL_CHAR_RE.test(password) ? "text-emerald-600" : ""}>특수문자</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Input
                name="passwordConfirm" type="password" label="비밀번호 확인"
                placeholder="비밀번호 재입력"
                value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                error={fieldErrors.passwordConfirm} autoComplete="new-password" required
              />
              {passwordConfirm && password === passwordConfirm && !fieldErrors.passwordConfirm && (
                <p className="mt-1 text-xs text-emerald-600">✓ 일치합니다</p>
              )}
            </div>

            {role === "driver" && (
              <>
                <Input name="vehicleNumber" label="차량번호" placeholder="12가 3456" required />
                <Select name="vehicleType" label="차량 종류"
                  options={VEHICLE_TYPES.map((v) => ({ value: v, label: v }))}
                  placeholder="차량 종류 선택" required
                />
              </>
            )}

            <div className="pt-1">
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                {role === "shipper" ? "화주로 가입하기" : "기사로 가입하기"}
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center">
              <a href="#" className="hover:text-gray-600">이용약관</a>
              {" · "}
              <a href="#" className="hover:text-gray-600">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
            </p>
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
