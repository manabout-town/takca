"use client"
import { useState } from "react"
import Link from "next/link"
import { signIn } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Logo } from "@/components/shared/Logo"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [kakaoLoading, setKakaoLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleKakao() {
    setKakaoLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setKakaoLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">로그인</h1>
          <p className="text-sm text-gray-400 mt-1">계속하려면 로그인하세요</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 카카오 로그인 */}
          <button
            type="button"
            onClick={handleKakao}
            disabled={kakaoLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-[#FEE500] hover:bg-[#F0D800] text-[#191919] font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-60 mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M9 1C4.582 1 1 3.896 1 7.455c0 2.272 1.52 4.267 3.818 5.394L3.91 16.06a.2.2 0 00.296.215L8.42 13.86c.189.014.38.022.58.022 4.418 0 8-2.896 8-6.427C17 3.896 13.418 1 9 1z"
                fill="#191919"/>
            </svg>
            {kakaoLoading ? "연결 중..." : "카카오로 로그인"}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="email" type="email" label="이메일" placeholder="name@example.com" autoComplete="email" required />
            <Input name="password" type="password" label="비밀번호" placeholder="••••••••" autoComplete="current-password" required />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              로그인
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-50 text-center text-sm text-gray-400">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="text-gray-900 font-semibold hover:underline">
              회원가입
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          <a href="#" className="hover:text-gray-600">이용약관</a>
          {" · "}
          <a href="#" className="hover:text-gray-600">개인정보처리방침</a>
        </p>
      </div>
    </div>
  )
}
