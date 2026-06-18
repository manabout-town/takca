"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { confirmStart, requestCompletion } from "@/app/actions/orders"
import { cancelMatch } from "@/app/actions/matches"

interface Props {
  matchId: string
  matchStatus: string
  orderId: string
  orderPrice?: number
}

export function MatchStatusButtons({ matchId, matchStatus, orderId, orderPrice = 0 }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const router = useRouter()

  const penaltyAmount = Math.floor(orderPrice * 0.2)

  function handleStart() {
    setError(null)
    startTransition(async () => {
      const result = await confirmStart(matchId)
      if (result?.error) setError(result.error)
      else router.refresh()
    })
  }

  function handleComplete() {
    setError(null)
    startTransition(async () => {
      const result = await requestCompletion(matchId)
      if (result?.error) setError(result.error)
      else router.push(`/chat/${matchId}`)
    })
  }

  function handleCancel() {
    setError(null)
    startTransition(async () => {
      const result = await cancelMatch(matchId, cancelReason)
      if (result?.error) {
        setError(result.error)
        setShowCancelDialog(false)
      } else {
        setShowCancelDialog(false)
        router.push("/driver/matches")
      }
    })
  }

  if (matchStatus === "completed" || matchStatus === "cancelled") return null

  return (
    <div className="mt-3 space-y-2" onClick={e => e.preventDefault()}>
      <div className="flex gap-2">
        {matchStatus === "accepted" && (
          <button
            onClick={handleStart}
            disabled={isPending}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? "처리 중..." : "🚚 운송 시작"}
          </button>
        )}
        {matchStatus === "in_progress" && (
          <button
            onClick={handleComplete}
            disabled={isPending}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? "처리 중..." : "✅ 완료 요청"}
          </button>
        )}
        {(matchStatus === "accepted" || matchStatus === "in_progress") && (
          <button
            onClick={() => setShowCancelDialog(true)}
            disabled={isPending}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-200 transition-colors disabled:opacity-50"
          >
            취소
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {showCancelDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowCancelDialog(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <h3 className="font-bold text-gray-900 text-lg">운송 취소</h3>
              <p className="text-sm text-gray-500 mt-1">취소 시 위약금이 부과됩니다</p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
              <div className="text-xs text-red-500 mb-1">부과 위약금 (운임의 20%)</div>
              <div className="text-2xl font-bold text-red-600">
                {penaltyAmount.toLocaleString()}원
              </div>
              {orderPrice > 0 && (
                <div className="text-xs text-gray-400 mt-1">기준 운임: {orderPrice.toLocaleString()}원</div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">취소 사유 (선택)</label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="취소 사유를 입력하세요..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={isPending}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                돌아가기
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {isPending ? "처리 중..." : "취소 확정"}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              취소 후 의뢰가 재공개되며 화주에게 위약금이 지급됩니다
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
