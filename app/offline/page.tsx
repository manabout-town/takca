"use client"
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="text-6xl mb-6">📡</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">인터넷 연결 없음</h1>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        네트워크 연결을 확인하고<br />다시 시도해주세요
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors min-h-[44px]"
      >
        다시 시도
      </button>
    </div>
  )
}
