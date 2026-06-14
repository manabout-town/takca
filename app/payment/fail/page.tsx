"use client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"

function FailContent() {
  const params = useSearchParams()
  const message = params.get("message") || "결제 중 오류가 발생했습니다"

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm w-full">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-xl font-bold mb-2">결제 실패</h1>
        <p className="text-gray-500 text-sm mb-8">{message}</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/shipper/dashboard"
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            대시보드로
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">로딩 중...</div></div>}>
      <FailContent />
    </Suspense>
  )
}
