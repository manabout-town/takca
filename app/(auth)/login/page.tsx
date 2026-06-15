"use client"
import { useState } from "react"
import Link from "next/link"
import { signIn } from "@/app/actions/auth"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl">🚛</span>
            <span className="text-xl font-bold text-gray-900 tracking-tight">화물로</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
          <p className="text-sm text-gray-500 mt-1.5">계속하려면 로그인하세요</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="email" type="email" label="이메일" placeholder="name@example.com" autoComplete="email" required />
            <Input name="password" type="password" label="비밀번호" placeholder="••••••••" autoComplete="current-password" required />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              로그인
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
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
