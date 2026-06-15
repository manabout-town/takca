import Link from "next/link"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email: emailParam } = await searchParams
  const email = emailParam || "입력하신 이메일"

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-6xl mb-6">📧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">이메일 인증 필요</h1>
        <p className="text-gray-500 mb-2">
          <span className="font-semibold text-gray-800">{email}</span>으로
        </p>
        <p className="text-gray-500 mb-8">
          인증 메일을 발송했습니다. 메일함을 확인하고 링크를 클릭해 인증을 완료해주세요.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 text-left space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">1</span>
            <div>
              <div className="font-semibold text-sm">이메일 메일함 열기</div>
              <div className="text-xs text-gray-500">스팸 폴더도 확인해주세요</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">2</span>
            <div>
              <div className="font-semibold text-sm">화물로 인증 메일 찾기</div>
              <div className="text-xs text-gray-500">발신자: noreply@supabase.io</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">3</span>
            <div>
              <div className="font-semibold text-sm">인증 링크 클릭</div>
              <div className="text-xs text-gray-500">링크 클릭 후 자동으로 로그인됩니다</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
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

        <p className="mt-6 text-xs text-gray-400">
          메일이 오지 않나요? 스팸 폴더를 확인하거나 잠시 후 다시 시도해주세요.
        </p>
      </div>
    </div>
  )
}
