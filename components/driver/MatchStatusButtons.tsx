"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { confirmStart, requestCompletion } from "@/app/actions/orders"
import { cancelMatch } from "@/app/actions/matches"

interface Props {
  matchId: string
  matchStatus: string
  orderId: string
  orderPrice?: number
  pickupAt?: string
}

function computePenalty(orderPrice: number, pickupAt?: string): { amount: number; label: string } {
  if (!pickupAt || orderPrice <= 0) return { amount: 0, label: "" }
  const now = new Date()
  const pickup = new Date(pickupAt)
  const hoursUntilPickup = (pickup.getTime() - now.getTime()) / (1000 * 60 * 60)
  const isSameDay = now.toDateString() === pickup.toDateString()

  if (isSameDay) {
    return { amount: Math.floor(orderPrice * 0.3), label: "당일 취소 (운임의 30%)" }
  } else if (hoursUntilPickup <= 12) {
    return { amount: Math.floor(orderPrice * 0.2), label: "12시간 이내 취소 (운임의 20%)" }
  }
  return { amount: 0, label: "위약금 없음" }
}

export function MatchStatusButtons({ matchId, matchStatus, orderId, orderPrice = 0, pickupAt }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const router = useRouter()

  const { amount: penaltyAmount, label: penaltyLabel } = computePenalty(orderPrice, pickupAt)

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
      {/* Condition report link */}
      {(matchStatus === "accepted" || matchStatus === "in_progress") && (
        <Link
          href={`/driver/matches/${matchId}/condition-report?type=${matchStatus === "accepted" ? "pickup" : "delivery"}`}
          className="flex items-center justify-between w-full px-3 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">📋</span>
            <span className="text-xs font-semibold text-amber-800">
              {matchStatus === "accepted" ? "픽업 전 차량 상태 기록" : "인도 후 차량 상태 기록"}
            </span>
          </div>
          <span className="text-xs text-amber-500">→</span>
        </Link>
      )}

      <div className="flex gap-2">
        {matchStatus === "accepted" && (
          <button
            onClick={handleStart}
            disabled={isPending}
            className="flex-1 py-2 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? "처리 중..." : "🚚 운송 시작"}
          </button>
        )}
        {matchStatus === "in_progress" && (
          <button
            onClick={handleComplete}
            disabled={isPending}
            className="flex-1 py-2 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? "처리 중..." : "✅ 완료 요청"}
          </button>
        )}
        {(matchStatus === "accepted" || matchStatus === "in_progress") && (
          <button
            onClick={() => setShowCancelDialog(true)}
            disabled={isPending}
            className="px-3 py-2 min-h-[44px] bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-200 transition-colors disabled:opacity-50"
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
              <p className="text-sm text-gray-500 mt-1">취소 전 아래 내용을 확인하세요</p>
            </div>

            <div className={`border rounded-xl p-4 text-center ${
              penaltyAmount > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"
            }`}>
              <div className={`text-xs mb-1 ${penaltyAmount > 0 ? "text-red-500" : "text-gray-500"}`}>
                {penaltyLabel}
              </div>
              <div className={`text-2xl font-bold ${penaltyAmount > 0 ? "text-red-600" : "text-gray-600"}`}>
                {penaltyAmount > 0 ? `${penaltyAmount.toLocaleString()}원` : "위약금 없음"}
              </div>
              {orderPrice > 0 && penaltyAmount > 0 && (
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
                className="flex-1 py-2.5 min-h-[44px] border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                돌아가기
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="flex-1 py-2.5 min-h-[44px] bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {isPending ? "처리 중..." : "취소 확정"}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              취소 후 의뢰가 재공개되며{penaltyAmount > 0 ? " 화주에게 위약금이 지급됩니다" : " 위약금이 부과되지 않습니다"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
