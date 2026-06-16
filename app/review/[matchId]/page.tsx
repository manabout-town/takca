"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ReviewPage({ params }: { params: { matchId: string } }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  async function submitReview() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || rating === 0) return

    const { data: match } = await supabase
      .from("matches")
      .select("driver_id, orders(shipper_id)")
      .eq("id", params.matchId)
      .single()

    if (!match) return

    const order = match.orders as any
    const isDriver = match.driver_id === user.id
    const revieweeId = isDriver ? order?.shipper_id : match.driver_id

    await supabase.from("reviews").insert({
      match_id: params.matchId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      comment: comment.trim() || null,
    })

    // Update driver rating avg
    if (!isDriver) {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("reviewee_id", match.driver_id)

      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
        await supabase
          .from("driver_profiles")
          .update({ rating_avg: avg, rating_count: reviews.length })
          .eq("user_id", match.driver_id)
      }
    }

    setSubmitted(true)
    setTimeout(() => router.push(isDriver ? "/driver/matches" : "/shipper/dashboard"), 2000)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2">리뷰가 등록되었습니다!</h2>
          <p className="text-gray-500 text-sm">잠시 후 이동합니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-black/30">
        <h1 className="text-2xl font-bold text-center mb-2 tracking-tight">거래 완료!</h1>
        <p className="text-gray-400 text-center mb-8">
          상대방에 대한 리뷰를 남겨주세요
        </p>

        {/* Star rating */}
        <div className="flex justify-center gap-2 mb-6">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-4xl transition-transform hover:scale-110"
            >
              <span className={(hovered || rating) >= star ? "text-yellow-400" : "text-gray-200"}>★</span>
            </button>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500 mb-6">
          {rating === 0 ? "별점을 선택하세요" :
           rating === 1 ? "매우 불만족" :
           rating === 2 ? "불만족" :
           rating === 3 ? "보통" :
           rating === 4 ? "만족" : "매우 만족"}
        </div>

        <textarea
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 mb-6"
          rows={3}
          placeholder="리뷰 내용을 입력해주세요 (선택사항)"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            건너뛰기
          </button>
          <button
            onClick={() => startTransition(submitReview)}
            disabled={rating === 0 || isPending}
            className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {isPending ? "등록 중..." : "리뷰 등록"}
          </button>
        </div>
      </div>
    </div>
  )
}
