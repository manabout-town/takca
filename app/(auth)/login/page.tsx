"use client"
import { useState } from "react"
import Link from "next/link"
import { signIn } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Logo } from "@/components/shared/Logo"

type Provider = "kakao" | "google" | "apple"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<Provider | null>(null)

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

  async function handleSocial(provider: Provider) {
    setSocialLoading(provider)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    setSocialLoading(null)
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

          {/* 소셜 로그인 */}
          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              onClick={() => handleSocial("kakao")}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-[#FEE500] hover:bg-[#F0D800] text-[#191919] font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M9 1C4.582 1 1 3.896 1 7.455c0 2.272 1.52 4.267 3.818 5.394L3.91 16.06a.2.2 0 00.296.215L8.42 13.86c.189.014.38.022.58.022 4.418 0 8-2.896 8-6.427C17 3.896 13.418 1 9 1z"
                  fill="#191919"/>
              </svg>
              {socialLoading === "kakao" ? "연결 중..." : "카카오로 로그인"}
            </button>

            <button
              type="button"
              onClick={() => handleSocial("google")}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm py-3 rounded-xl border border-gray-200 transition-colors disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.705A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.705V4.963H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.037l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.963L3.964 7.295C4.672 5.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {socialLoading === "google" ? "연결 중..." : "구글로 로그인"}
            </button>

            <button
              type="button"
              onClick={() => handleSocial("apple")}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-black hover:bg-gray-900 text-white font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M13.117 9.57c-.02-2.107 1.72-3.12 1.8-3.172-.978-1.43-2.5-1.626-3.048-1.647-1.3-.131-2.54.764-3.198.764-.66 0-1.677-.746-2.76-.727-1.42.02-2.73.824-3.46 2.1-1.477 2.56-.38 6.356 1.062 8.434.703 1.018 1.542 2.16 2.641 2.12 1.06-.042 1.46-.683 2.742-.683 1.282 0 1.64.683 2.76.66 1.14-.02 1.86-1.038 2.558-2.059.806-1.18 1.138-2.322 1.158-2.38-.025-.01-2.218-.85-2.238-3.37h.002z" fill="white"/>
                <path d="M10.98 2.795c.582-.706.976-1.688.868-2.665-.84.034-1.858.56-2.46 1.265-.54.623-1.014 1.622-.888 2.578.936.072 1.898-.475 2.48-1.178z" fill="white"/>
              </svg>
              {socialLoading === "apple" ? "연결 중..." : "Apple로 로그인"}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">또는 이메일로 로그인</span>
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
