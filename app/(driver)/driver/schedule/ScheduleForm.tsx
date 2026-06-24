"use client"
import { useState, useTransition } from "react"
import { postSchedule } from "@/app/actions/schedule"
import { CITY_DISTRICTS, PROVINCES, CARGO_TYPES } from "@/lib/constants/regions"

const VEHICLE_TYPES = ["다마스/라보","1톤","1.4톤","2.5톤","3.5톤","5톤","11톤","18톤","25톤","윙바디","냉동/냉장","특수차량"]

export function ScheduleForm({ defaultVehicleType }: { defaultVehicleType?: string }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ msg: string; isError: boolean } | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [destRegions, setDestRegions] = useState<string[]>([])
  const [cargoTypes, setCargoTypes] = useState<string[]>([])

  function showFeedback(msg: string, isError = false) {
    setFeedback({ msg, isError })
    setTimeout(() => setFeedback(null), 4000)
  }

  function toggleDest(region: string) {
    setDestRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    )
  }

  function toggleCargo(type: string) {
    setCargoTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  function addEntireProvince(province: string) {
    const districts = CITY_DISTRICTS[province]
    setDestRegions(prev => {
      const toAdd = districts.filter(d => !prev.includes(`${province} ${d}`))
      return [...prev, ...toAdd.map(d => `${province} ${d}`)]
    })
  }

  const today = new Date().toISOString().split("T")[0]

  function handleSubmit(formData: FormData) {
    formData.set("dest_regions", destRegions.join(","))
    formData.set("cargo_types", cargoTypes.join(","))
    startTransition(async () => {
      const result = await postSchedule(formData)
      if (result?.error) showFeedback(result.error, true)
      else {
        showFeedback("가용 일정이 등록되었습니다")
        setDestRegions([])
        setCargoTypes([])
        setSelectedProvince(null)
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-900 mb-5 text-sm">가용 일정 등록</h2>

      {feedback && (
        <div className={`mb-4 text-sm px-4 py-2.5 rounded-xl ${feedback.isError ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
          {feedback.isError ? "⚠ " : "✓ "}{feedback.msg}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        {/* 날짜 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">운행 가능 날짜<span className="text-red-400 ml-0.5">*</span></label>
          <input type="date" name="available_date" min={today} required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>

        {/* 출발지 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">출발 지역<span className="text-red-400 ml-0.5">*</span></label>
            <select name="origin_city" required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">시/도 선택</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">출발지 상세</label>
            <input type="text" name="origin_detail" placeholder="예: 수원시 팔달구"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
        </div>

        {/* 도착 가능 지역 — 2단계 선택 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            도착 가능 지역 (시/구·군)<span className="text-red-400 ml-0.5">*</span>
          </label>

          {/* 선택된 도착지 chips */}
          {destRegions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              {destRegions.map(r => (
                <span key={r} className="inline-flex items-center gap-1 bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  {r}
                  <button type="button" onClick={() => setDestRegions(prev => prev.filter(x => x !== r))} className="hover:text-indigo-200 transition-colors">×</button>
                </span>
              ))}
            </div>
          )}

          {/* Step 1: 시/도 선택 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PROVINCES.map(p => (
              <button key={p} type="button"
                onClick={() => setSelectedProvince(selectedProvince === p ? null : p)}
                className={`px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium border transition-all ${
                  selectedProvince === p
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}>
                {p}
              </button>
            ))}
          </div>

          {/* Step 2: 해당 시/도의 구/군/시 */}
          {selectedProvince && (
            <div className="border border-gray-100 rounded-xl p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">{selectedProvince} — 구/군/시 선택</span>
                <button type="button" onClick={() => addEntireProvince(selectedProvince)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  전체 선택
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CITY_DISTRICTS[selectedProvince].map(d => {
                  const key = `${selectedProvince} ${d}`
                  const active = destRegions.includes(key)
                  return (
                    <button key={d} type="button" onClick={() => toggleDest(key)}
                      className={`px-2.5 py-2 min-h-[44px] rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                      }`}>
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 차량 & 화물 */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">차량 종류</label>
            <select name="vehicle_type" defaultValue={defaultVehicleType || ""}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">무관</option>
              {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">취급 가능 화물 (복수 선택)</label>
            <div className="flex flex-wrap gap-1.5">
              {CARGO_TYPES.map(c => {
                const active = cargoTypes.includes(c)
                return (
                  <button key={c} type="button" onClick={() => toggleCargo(c)}
                    className={`px-3 py-2 min-h-[44px] rounded-full text-xs font-medium border transition-all ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                    }`}>
                    {c}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">메모 (선택)</label>
          <textarea name="memo" placeholder="추가 안내 사항을 입력하세요" rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>

        <button type="submit" disabled={isPending || destRegions.length === 0}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {isPending ? "등록 중..." : "가용 일정 등록"}
        </button>
        {destRegions.length === 0 && (
          <p className="text-xs text-gray-400 text-center -mt-2">도착 가능 지역을 1개 이상 선택해주세요</p>
        )}
      </form>
    </div>
  )
}
