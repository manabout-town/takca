import { createClient } from "@/lib/supabase/server"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { signOut } from "@/app/actions/auth"

export default async function DriverMyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: driverProfile }, { data: matches }, { data: reviews }] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", user!.id).single(),
      supabase.from("driver_profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("matches").select("*, orders(price)").eq("driver_id", user!.id),
      supabase.from("reviews").select("*").eq("reviewee_id", user!.id).order("created_at", { ascending: false }),
    ])

  const completedMatches = matches?.filter(m => m.status === "completed") || []
  const totalEarned = completedMatches.reduce((s: number, m: any) =>
    s + Math.floor((m.orders?.price || 0) * 0.96), 0)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>

      {/* Profile Card */}
      <Card className="mb-4">
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              🚛
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">{profile?.name}</div>
              <div className="text-sm text-gray-500">{profile?.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">
                  {driverProfile?.rating_avg?.toFixed(1) || "신규"}
                </span>
                <span className="text-sm text-gray-400">
                  ({driverProfile?.rating_count || 0}건)
                </span>
                {driverProfile?.is_verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ 인증됨</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">차량번호</span>
              <div className="font-medium mt-0.5">{driverProfile?.vehicle_number || "-"}</div>
            </div>
            <div>
              <span className="text-gray-500">차종</span>
              <div className="font-medium mt-0.5">{driverProfile?.vehicle_type || "-"}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "총 운송", value: `${completedMatches.length}건` },
          { label: "총 수입", value: formatKRW(totalEarned) },
          { label: "평점", value: driverProfile?.rating_avg?.toFixed(1) || "신규" },
        ].map(s => (
          <Card key={s.label}>
            <CardBody className="text-center py-4">
              <div className="font-bold text-lg text-blue-700">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <Card className="mb-4">
          <CardHeader><h2 className="font-bold">받은 리뷰</h2></CardHeader>
          <CardBody className="p-0">
            <div className="divide-y">
              {reviews.slice(0, 5).map((r: any) => (
                <div key={r.id} className="px-6 py-3">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < r.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                    ))}
                    <span className="text-xs text-gray-400 ml-2">{formatDate(r.created_at)}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <form action={signOut}>
        <button type="submit"
          className="w-full py-3 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
          로그아웃
        </button>
      </form>
    </div>
  )
}
