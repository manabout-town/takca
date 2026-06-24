"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { submitDispute } from "@/app/actions/disputes"
import Link from "next/link"
import { Suspense } from "react"

function DisputeForm({ orderId }: { orderId: string }) {
  const params = useSearchParams()
  const matchId = params.get("matchId") || ""
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim() || !matchId) {
      setError("매칭 정보가 없습니다. 채팅방에서 다시 시도해주세요.")
      return
    }
    setLoading(true)
    setError(null)
    const fd = new FormData()
    fd.set("matchId", matchId)
    fd.set("reason", reason)
    const result = await submitDispute(fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/shipper/orders/${orderId}`)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Link href={`/shipper/orders/${orderId}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← 의뢰 상세
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-xl font-bold">분쟁 신고</h1>
          <p className="text-sm text-gray-500 mt-1">신고 후 관리자가 검토합니다</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">신고 사유</label>
            <textarea
              className="input resize-none"
              rows={5}
              placeholder="분쟁 사유를 상세히 설명해주세요"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-xs text-orange-700">
            에스크로 금액은 분쟁 해결 전까지 보관됩니다.
          </div>
          <button
            type="submit"
            disabled={!reason.trim() || loading}
            className="w-full py-3.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition min-h-[44px]"
          >
            {loading ? "제출 중..." : "분쟁 신고하기"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function DisputePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">로딩 중...</div></div>}>
      <DisputeForm orderId={params.id} />
    </Suspense>
  )
}
