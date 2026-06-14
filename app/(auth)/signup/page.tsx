"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signUp } from "@/app/actions/auth"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { VEHICLE_TYPES } from "@/lib/types"

function SignupForm() {
  const params = useSearchParams()
  const [role, setRole] = useState<"shipper" | "driver">(
    (params.get("role") as "shipper" | "driver") || "shipper"
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    formData.set("role", role)
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🚛</span>
            <span className="text-2xl font-bold text-blue-700">화물로</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">회원가입</h1>
        </div>

        {/* Role selector */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
          {(["shipper", "driver"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === r
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r === "shipper" ? "🏢 화주" : "🚛 기사"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <form action={handleSubmit} className="space-y-4">
            <Input name="name" label="이름" placeholder="홍길동" required />
            <Input name="email" type="email" label="이메일" placeholder="email@example.com" required />
            <Input name="phone" type="tel" label="연락처" placeholder="010-0000-0000" required />
            <Input
              name="password"
              type="password"
              label="비밀번호"
              placeholder="8자 이상"
              minLength={8}
              required
            />

            {role === "driver" && (
              <>
                <Input
                  name="vehicleNumber"
                  label="차량번호"
                  placeholder="00가 0000"
                  required
                />
                <Select
                  name="vehicleType"
                  label="차량 종류"
                  options={VEHICLE_TYPES.map((v) => ({ value: v, label: v }))}
                  placeholder="차량 종류 선택"
                  required
                />
              </>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {role === "shipper" ? "화주로 가입하기" : "기사로 가입하기"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
