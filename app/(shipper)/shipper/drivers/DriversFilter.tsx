"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type Props = {
  provinces: string[]
  vehicleTypes: string[]
  initialDate?: string
  initialOrigin?: string
  initialDest?: string
  initialVehicle?: string
}

export function DriversFilter({ provinces, vehicleTypes, initialDate, initialOrigin, initialDest, initialVehicle }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const push = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/shipper/drivers?${params.toString()}`)
  }, [router, searchParams])

  const hasFilter = !!(initialDate || initialOrigin || initialDest || initialVehicle)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 날짜 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">날짜</label>
          <input
            type="date"
            defaultValue={initialDate || ""}
            min={new Date().toISOString().split("T")[0]}
            onChange={e => push("date", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* 출발지 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">출발 지역</label>
          <select
            defaultValue={initialOrigin || ""}
            onChange={e => push("origin", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="">전체</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* 도착지 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">도착 지역</label>
          <select
            defaultValue={initialDest || ""}
            onChange={e => push("dest", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="">전체</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* 차량 종류 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">차량 종류</label>
          <select
            defaultValue={initialVehicle || ""}
            onChange={e => push("vehicle", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="">전체</option>
            {vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {hasFilter && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">적용된 필터:</span>
          {initialDate && (
            <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-100 font-medium">
              {initialDate}
              <button onClick={() => push("date", "")} className="hover:text-orange-900">×</button>
            </span>
          )}
          {initialOrigin && (
            <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-100 font-medium">
              출발: {initialOrigin}
              <button onClick={() => push("origin", "")} className="hover:text-orange-900">×</button>
            </span>
          )}
          {initialDest && (
            <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-100 font-medium">
              도착: {initialDest}
              <button onClick={() => push("dest", "")} className="hover:text-orange-900">×</button>
            </span>
          )}
          {initialVehicle && (
            <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-100 font-medium">
              {initialVehicle}
              <button onClick={() => push("vehicle", "")} className="hover:text-orange-900">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
