"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback, Suspense } from "react"

interface FeedFilterProps { cargoTypes: string[] }

function FeedFilterInner({ cargoTypes }: FeedFilterProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [origin, setOrigin] = useState(params.get("origin") || "")
  const [cargoType, setCargoType] = useState(params.get("cargoType") || "")

  const apply = useCallback(() => {
    const p = new URLSearchParams()
    if (origin) p.set("origin", origin)
    if (cargoType) p.set("cargoType", cargoType)
    router.push(`/driver/feed?${p.toString()}`)
  }, [origin, cargoType, router])

  const reset = useCallback(() => {
    setOrigin("")
    setCargoType("")
    router.push("/driver/feed")
  }, [router])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">출발지</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
            placeholder="예: 서울"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            onKeyDown={e => e.key === "Enter" && apply()}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">화물 종류</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={cargoType}
            onChange={e => setCargoType(e.target.value)}
          >
            <option value="">전체</option>
            {cargoTypes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={apply}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            검색
          </button>
          <button
            onClick={reset}
            className="border border-gray-200 text-gray-500 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  )
}

export function FeedFilter({ cargoTypes }: FeedFilterProps) {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 h-[72px] animate-pulse" />
    }>
      <FeedFilterInner cargoTypes={cargoTypes} />
    </Suspense>
  )
}
