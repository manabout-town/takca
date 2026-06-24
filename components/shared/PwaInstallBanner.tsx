"use client"
import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("pwa-dismissed")) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!visible || !deferredPrompt) return null

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "dismissed") localStorage.setItem("pwa-dismissed", "1")
    setVisible(false)
    setDeferredPrompt(null)
  }

  function dismiss() {
    localStorage.setItem("pwa-dismissed", "1")
    setVisible(false)
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-xl">
        🚛
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">탁카 앱 설치</p>
        <p className="text-xs text-gray-400 mt-0.5">홈 화면에 추가하면 더 빠르게 이용해요</p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={install}
          className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
        >
          설치
        </button>
        <button
          onClick={dismiss}
          className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
