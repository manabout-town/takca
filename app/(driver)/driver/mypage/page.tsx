import { createClient } from "@/lib/supabase/server"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { signOut } from "@/app/actions/auth"

export default async function DriverMyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: dp }, { data: matches }, { data: reviews }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user!.id).single(),
    supabase.from("driver_profiles").select("*").eq("user_id", user!.id).single(),
    supabase.from("matches").select("*, orders(price)").eq("driver_id", user!.id),
    supabase.from("reviews").select("*").eq("reviewee_id", user!.id).order("created_at", { ascending: false }),
  ])

  const completedMatches = matches?.filter(m => m.status === "completed") || []
  const totalEarned = completedMatches.reduce((s: number, m: any) =>
    s + Math.floor((m.orders?.price || 0) * 0.96), 0)

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">마이페이지</h1>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">🚛</div>
          <div>
            <p className="font-bold text-lg">{profile?.name}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <p className="text-sm text-gray-500">{profile?.phone}</p>
            <p className="text-xs text-gray-400 mt-1">가입일: {formatDate(profile?.created_at)}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 w-24">차량번호</span>
            <span className="font-medium">{dp?.vehicle_number || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 w-24">차량 종류</span>
            <span className="font-medium">{dp?.vehicle_type || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 w-24">거주지</span>
            <span className="font-medium">{dp?.home_region || <span className="text-gray-400">미설정</span>}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-gray-500 w-24 mt-0.5">운송 루트</span>
            <div className="flex flex-wrap gap-1">
              {dp?.route_regions?.length > 0
                ? dp.route_regions.map((r: string) => (
                  <span key={r} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{r}</span>
                ))
                : <span className="text-gray-400">미설정</span>
              }
            </div>
          </div>
          {dp?.is_verified && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-24">인증</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">✓ 인증 기사</span>
            </div>
          )}
          {(dp?.rating_avg || 0) > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-24">평점</span>
              <span className="font-bold text-amber-600">★ {(dp?.rating_avg || 0).toFixed(1)}</span>
              <span className="text-gray-400 text-xs">({dp?.rating_count || 0}건)</span>
            </div>
          )}
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "총 운송", value: `${matches?.length || 0}건` },
          { label: "완료", value: `${completedMatches.length}건` },
          { label: "총 수익", value: formatKRW(totalEarned) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className="font-bold text-lg text-emerald-700">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 최근 리뷰 */}
      {reviews && reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold mb-3">받은 리뷰</h2>
          <div className="space-y-3">
            {reviews.slice(0, 3).map((r: any) => (
              <div key={r.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={i <= r.rating ? "text-amber-400" : "text-gray-200"}>★</span>
                  ))}
                </div>
                {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                <p className="text-xs text-gray-400 mt-1">{formatDate(r.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <form action={signOut}>
        <button type="submit" className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
          로그아웃
        </button>
      </form>
    </div>
  )
}
