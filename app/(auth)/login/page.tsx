"use client"
import { useState } from "react"
import Link from "next/link"
import { signIn } from "@/app/actions/auth"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
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
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🚛</span>
            <span className="text-2xl font-bold text-blue-700">화물로</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">로그인</h1>
          <p className="text-sm text-gray-500 mt-1">계정에 로그인하세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error === "Invalid login credentials"
                ? "이메일 또는 비밀번호가 올바르지 않습니다"
                : error}
            </div>
          )}
          <form action={handleSubmit} className="space-y-4">
            <Input name="email" type="email" label="이메일" placeholder="email@example.com" required />
            <Input name="password" type="password" label="비밀번호" placeholder="비밀번호 입력" required />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              로그인
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
