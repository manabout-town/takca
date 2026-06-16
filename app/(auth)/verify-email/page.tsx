import Link from "next/link"
import { Logo } from "@/components/shared/Logo"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email: emailParam } = await searchParams
  const email = emailParam || "입력하신 이메일"

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.06)_0%,_transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-sm text-center relative z-10">
        <div className="flex justify-center mb-8">
          <Logo size="lg" variant="light" />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl shadow-black/30">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
            📧
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">이메일 인증 필요</h1>
          <p className="text-gray-500 text-sm mb-2">
            <span className="font-semibold text-gray-800">{email}</span>으로
          </p>
          <p className="text-gray-500 text-sm mb-7">
            인증 메일을 발송했습니다. 메일함을 확인하고 링크를 클릭해 인증을 완료해주세요.
          </p>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 text-left space-y-4">
            {[
              { step: "1", title: "이메일 메일함 열기", desc: "스팸 폴더도 확인해주세요" },
              { step: "2", title: "화물로 인증 메일 찾기", desc: "발신자: noreply@supabase.io" },
              { step: "3", title: "인증 링크 클릭", desc: "링크 클릭 후 자동으로 로그인됩니다" },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{s.step}</span>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{s.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
            >
              로그인 페이지로 이동
            </Link>
            <Link
              href="/signup"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors text-sm"
            >
              다른 이메일로 다시 가입
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-600">
          메일이 오지 않나요? 스팸 폴더를 확인하거나 잠시 후 다시 시도해주세요.
        </p>
      </div>
    </div>
  )
}
