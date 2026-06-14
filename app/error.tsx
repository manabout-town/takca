"use client"
import { useEffect } from "react"
import Link from "next/link"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</h1>
        <p className="text-gray-500 mb-6 text-sm">{error.message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 text-sm">
            다시 시도
          </button>
          <Link href="/" className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 text-sm">
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
