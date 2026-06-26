"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback, Suspense } from "react"

function FeedFilterInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [origin, setOrigin] = useState(params.get("origin") || "")
  const [urgent, setUrgent] = useState(params.get("urgent") || "")

  const apply = useCallback(() => {
    const p = new URLSearchParams()
    if (origin) p.set("origin", origin)
    if (urgent) p.set("urgent", urgent)
    router.push(`/driver/feed?${p.toString()}`)
  }, [origin, urgent, router])

  const reset = useCallback(() => {
    setOrigin("")
    setUrgent("")
    router.push("/driver/feed")
  }, [router])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">출발지</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
            placeholder="예: 서울"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            onKeyDown={e => e.key === "Enter" && apply()}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">긴급 여부</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 min-h-[44px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            value={urgent}
            onChange={e => setUrgent(e.target.value)}
          >
            <option value="">전체</option>
            <option value="true">긴급만</option>
            <option value="false">일반만</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={apply}
            className="bg-[#FF6B2B] hover:bg-orange-600 text-white px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold transition-colors"
          >
            검색
          </button>
          <button
            onClick={reset}
            className="border border-gray-200 text-gray-500 hover:bg-gray-50 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  )
}

export function FeedFilter() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 h-[72px] animate-pulse" />
    }>
      <FeedFilterInner />
    </Suspense>
  )
}
