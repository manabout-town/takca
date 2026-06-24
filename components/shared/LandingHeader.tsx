"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const NAV = [
  { label: "서비스 소개", href: "#about" },
  { label: "이용 방법", href: "#how" },
  { label: "핵심 기능", href: "#features" },
  { label: "의뢰 현황", href: "#orders" },
]

export function LandingHeader() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return }
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single()
      setRole(profile?.role ?? null)
      setLoading(false)
    })
  }, [])

  const dashboardHref =
    role === "driver" ? "/driver/dashboard"
    : role === "admin" ? "/admin/dashboard"
    : "/shipper/dashboard"

  const roleLabel =
    role === "driver" ? "기사"
    : role === "admin" ? "관리자"
    : "화주"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: 60 }}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="3" width="15" height="13" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M16 8h4l3 3v5h-7V8z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="5.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2"/>
              <circle cx="18.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-extrabold text-base tracking-tight">탁카</span>
            <span className="text-orange-400 text-[9px] font-semibold tracking-widest">카 캐리어 전문</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV.map(n => (
            <a key={n.label} href={n.href}
              className="px-3 py-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
              {n.label}
            </a>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-32 h-8 rounded-lg bg-white/5 animate-pulse" />
          ) : role ? (
            <>
              <span className="text-xs text-gray-500 px-2 py-1 rounded-full border border-white/10">
                {roleLabel}
              </span>
              <Link href={dashboardHref}
                className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all hover:shadow-lg hover:shadow-orange-500/20">
                대시보드
              </Link>
            </>
          ) : (
            <>
              <Link href="/login"
                className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors">
                로그인
              </Link>
              <Link href="/signup"
                className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all hover:shadow-lg hover:shadow-orange-500/20">
                무료 시작
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
