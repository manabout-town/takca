"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { confirmStart, requestCompletion } from "@/app/actions/orders"

interface Props {
  matchId: string
  matchStatus: string
  orderId: string
}

export function MatchStatusButtons({ matchId, matchStatus, orderId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

  if (matchStatus === "completed" || matchStatus === "cancelled") return null

  return (
    <div className="mt-3 flex gap-2" onClick={e => e.preventDefault()}>
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
      {error && <p className="text-xs text-red-500 self-center">{error}</p>}
    </div>
  )
}
