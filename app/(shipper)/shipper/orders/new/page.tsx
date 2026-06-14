"use client"
import { useState, useTransition } from "react"
import { createOrder } from "@/app/actions/orders"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { CARGO_TYPES } from "@/lib/types"
import { PageHeader } from "@/components/shared/PageHeader"

export default function NewOrderPage() {
  const [isPending, startTransition] = useTransition()
  const [isUrgent, setIsUrgent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set("isUrgent", isUrgent.toString())

    startTransition(async () => {
      const result = await createOrder(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="의뢰 등록" description="운송 의뢰 정보를 입력해주세요" />

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="origin" label="출발지" placeholder="예: 서울시 강남구" required />
            <Input name="destination" label="도착지" placeholder="예: 부산시 해운대구" required />
          </div>

          <Select
            name="cargoType"
            label="화물 종류"
            options={CARGO_TYPES.map(c => ({ value: c, label: c }))}
            placeholder="화물 종류 선택"
            required
          />

          <div>
            <label className="label">화물 상세 설명</label>
            <textarea
              name="cargoDetail"
              className="input resize-none"
              rows={3}
              placeholder="화물의 크기, 무게, 주의사항 등을 자유롭게 입력하세요"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">희망 금액 (원)</label>
              <input
                type="number"
                name="price"
                className="input"
                placeholder="100000"
                min={0}
                step={1000}
                required
              />
            </div>
            <Input
              name="pickupAt"
              type="datetime-local"
              label="픽업 날짜/시간"
              required
            />
          </div>

          {/* Urgent boosting */}
          <div
            onClick={() => setIsUrgent(!isUrgent)}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              isUrgent
                ? "border-orange-400 bg-orange-50"
                : "border-dashed border-gray-300 hover:border-orange-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                isUrgent ? "bg-orange-500 border-orange-500" : "border-gray-400"
              }`}>
                {isUrgent && <span className="text-white text-xs">✓</span>}
              </div>
              <div>
                <div className="font-semibold text-sm">
                  ⚡ 긴급 부스팅 추가 (+1,000원)
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  피드 상단에 노출되어 더 빠른 매칭을 받을 수 있습니다
                </div>
              </div>
            </div>
          </div>

          {/* Price summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>희망 운임</span>
              <span>- 원</span>
            </div>
            {isUrgent && (
              <div className="flex justify-between text-orange-600">
                <span>긴급 부스팅</span>
                <span>+ 1,000원</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500 text-xs pt-1 border-t">
              <span>거래 완료 시 수수료 (4%)</span>
              <span>자동 정산</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <a href="/shipper/dashboard" className="btn-secondary flex-1 text-center py-2.5 rounded-lg text-sm">
              취소
            </a>
            <Button type="submit" className="flex-1" size="lg" loading={isPending}>
              의뢰 등록
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
