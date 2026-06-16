"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { completeProfile } from "@/app/actions/onboarding"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { Logo } from "@/components/shared/Logo"
import { VEHICLE_TYPES } from "@/lib/types"

const PHONE_RE = /^01[0-9]\d{7,8}$/
const REGIONS = [
  "서울","경기","인천","강원","충북","충남","대전","세종",
  "전북","전남","광주","경북","경남","대구","울산","부산","제주"
]

function OnboardingForm() {
  const params = useSearchParams()
  const initialRole = (params.get("role") as "shipper" | "driver") || "shipper"

  const [role, setRole] = useState<"shipper" | "driver">(initialRole)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([])

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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
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

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name" label="이름" placeholder="홍길동" required
              value={name} onChange={e => setName(e.target.value)}
            />
            <Input name="phone" type="tel" label="휴대폰 번호" placeholder="010-1234-5678" required />

            {role === "driver" && (
              <>
                <Input name="vehicleNumber" label="차량번호" placeholder="12가 3456" required />
                <Select name="vehicleType" label="차량 종류"
                  options={VEHICLE_TYPES.map(v => ({ value: v, label: v }))}
                  placeholder="차량 종류 선택" required />
                <Select name="homeRegion" label="거주지 (활동 지역)"
                  options={REGIONS.map(r => ({ value: r, label: r }))}
                  placeholder="거주지 선택" />
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
