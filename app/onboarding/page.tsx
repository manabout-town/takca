"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { completeProfile } from "@/app/actions/onboarding"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { Logo } from "@/components/shared/Logo"

const PHONE_RE = /^01[0-9]\d{7,8}$/
const REGIONS = [
  "서울","경기","인천","강원","충북","충남","대전","세종",
  "전북","전남","광주","경북","경남","대구","울산","부산","제주"
]

const BUSINESS_TYPES = ["법인사업자", "개인사업자", "개인(사업자등록 없음)"]

function OnboardingForm() {
  const params = useSearchParams()
  const initialRole = (params.get("role") as "shipper" | "driver") || "shipper"

  const [role, setRole] = useState<"shipper" | "driver">(initialRole)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([])
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState<string | null>(null)

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^0-9]/g, "")
    setPhone(val)
    if (val && !PHONE_RE.test(val)) {
      setPhoneError("010으로 시작하는 10-11자리 숫자를 입력하세요")
    } else {
      setPhoneError(null)
    }
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = "/login"; return }
      const meta = user.user_metadata
      const fullName = meta?.full_name || meta?.name || meta?.user_name || ""
      if (fullName) setName(fullName)
    })
  }, [])

  function toggleRoute(region: string) {
    setSelectedRoutes(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("role", role)
    formData.set("routeRegions", JSON.stringify(selectedRoutes))
    setLoading(true)
    const result = await completeProfile(formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10 overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.08)_0%,_transparent_60%)] pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6"><Logo size="lg" variant="light" /></div>
          <h1 className="text-xl font-bold text-white">프로필 설정</h1>
          <p className="text-sm text-gray-500 mt-1">서비스 이용을 위해 정보를 입력해주세요</p>
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

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-5 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name" label="이름 *" placeholder="홍길동" required
              value={name} onChange={e => setName(e.target.value)}
            />
            <div>
              <Input
                name="phone" type="tel" label="휴대폰 번호 *" placeholder="01012345678" required
                value={phone} onChange={handlePhoneChange}
              />
              {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
            </div>

            {role === "shipper" && (
              <>
                <Input name="companyName" label="회사명 (선택)" placeholder="(주)탁카컴퍼니" />
                <Select name="businessType" label="사업자 유형 (선택)"
                  options={BUSINESS_TYPES.map(t => ({ value: t, label: t }))}
                  placeholder="사업자 유형 선택" />
                <Input name="businessNumber" label="사업자번호 (선택)" placeholder="000-00-00000" />
              </>
            )}

            {role === "driver" && (
              <>
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm text-orange-700">
                  차량 정보는 인증 단계에서 입력합니다.
                </div>
                <Select name="homeRegion" label="거주지 (활동 지역)"
                  options={REGIONS.map(r => ({ value: r, label: r }))}
                  placeholder="거주지 선택" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주요 운송 루트 (복수 선택)</label>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map(region => (
                      <button key={region} type="button" onClick={() => toggleRoute(region)}
                        className={`px-3 py-2 min-h-[44px] rounded-full text-xs font-medium border transition-all ${
                          selectedRoutes.includes(region)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                        }`}>
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="pt-1">
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                {role === "shipper" ? "화주로 시작하기" : "기사로 시작하기"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 text-sm">로딩 중...</div>
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  )
}
