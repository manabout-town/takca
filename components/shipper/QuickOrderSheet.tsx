"use client"
import { useState, useTransition, useRef, useEffect } from "react"
import { createOrder } from "@/app/actions/orders"
import { ClipboardPlus, X } from "lucide-react"

export function QuickOrderSheet() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("isUrgent", "false")
    formData.set("vehicleCount", "1")

    startTransition(async () => {
      const result = await createOrder(formData)
      if (result?.error) setError(result.error)
      // 성공 시 createOrder가 redirect 처리
    })
  }

  // 오늘 날짜 기본값 (datetime-local 형식)
  const now = new Date()
  now.setMinutes(0, 0, 0)
  now.setHours(now.getHours() + 1)
  const defaultPickup = now.toISOString().slice(0, 16)

  return (
    <>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0 mt-1 min-h-[44px]"
      >
        <ClipboardPlus className="w-4 h-4" />
        간편 등록
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8 pt-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">간편 의뢰 등록</h2>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  출발지 <span className="text-red-500">*</span>
                </label>
                <input
                  name="origin"
                  type="text"
                  placeholder="예: 서울 강남구"
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  도착지 <span className="text-red-500">*</span>
                </label>
                <input
                  name="destination"
                  type="text"
                  placeholder="예: 부산 해운대구"
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  희망 금액 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  name="price"
                  type="number"
                  placeholder="100,000"
                  min={10000}
                  step={1000}
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  픽업 날짜/시간 <span className="text-red-500">*</span>
                </label>
                <input
                  name="pickupAt"
                  type="datetime-local"
                  defaultValue={defaultPickup}
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                차량 메모 <span className="text-gray-300 font-normal">(선택)</span>
              </label>
              <input
                name="vehicleNotes"
                type="text"
                placeholder="예: 아반떼 1대"
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <p className="text-xs text-gray-400">
              차량 1대 기준 등록됩니다. 복수 차량이나 추가 옵션은{" "}
              <a href="/shipper/orders/new" className="text-orange-500 underline">상세 등록</a>을 이용하세요.
            </p>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors min-h-[52px]"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-2 flex-grow-[2] py-3.5 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-60 min-h-[52px]"
              >
                {isPending ? "등록 중..." : "의뢰 등록하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
