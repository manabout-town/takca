import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/EmptyState"
import { KakaoRouteMap } from "@/components/shared/KakaoRouteMap"
import { DriverRankBadge } from "@/components/shared/DriverRankBadge"
import { formatKRW } from "@/lib/utils/format"
import Link from "next/link"

export default async function DriverDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("users").select("*").eq("id", user!.id).single()
  const { data: driverProfile } = await supabase.from("driver_profiles").select("*").eq("user_id", user!.id).single()
  const { data: matches } = await supabase
    .from("matches")
    .select("*, orders(*, shippers:users!shipper_id(name, phone))")
    .eq("driver_id", user!.id)
    .order("matched_at", { ascending: false })
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "pending")
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3)

  const totalMatches = matches?.length || 0
  const completedMatches = matches?.filter(m => m.status === "completed").length || 0
  const totalEarnings = matches
    ?.filter(m => m.status === "completed")
    .reduce((s, m) => s + ((m.orders as any)?.price || 0) * 0.96, 0) || 0
  const completionRate = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0
  const activeMatch = matches?.find(m => ["accepted","in_progress"].includes(m.status))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{profile?.name || "기사"}님, 안녕하세요</h1>
          <div className="mt-1.5">
            <DriverRankBadge completedCount={completedMatches} size="sm" showProgress={false} />
          </div>
        </div>
        <Link href="/driver/feed" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          의뢰 피드
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "누적 운송", value: `${totalMatches}건` },
          { label: "완료", value: `${completedMatches}건` },
          { label: "완료율", value: `${completionRate}%` },
          { label: "총 수익", value: formatKRW(Math.round(totalEarnings)) },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Driver profile card */}
      {driverProfile && (
        <div className="bg-gray-950 rounded-2xl p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl">🚛</div>
            <div>
              <div className="font-semibold">{profile?.name}</div>
              <div className="text-gray-400 text-sm mt-0.5">{driverProfile.vehicle_type} · {driverProfile.vehicle_number}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-amber-400 text-xs">★ {driverProfile.rating_avg?.toFixed(1) || "0.0"}</span>
                <span className="text-gray-500 text-xs">({driverProfile.rating_count || 0}건)</span>
                {driverProfile.is_verified && <span className="text-emerald-400 text-xs">· 인증됨</span>}
              </div>
            </div>
          </div>
          <Link href="/driver/profile" className="text-xs text-gray-500 hover:text-gray-300">편집 →</Link>
        </div>
      )}

      {/* Active match with route map */}
      {activeMatch && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* 상태 배너 */}
          <div className={`px-5 py-3 flex items-center justify-between ${
            activeMatch.status === "in_progress"
              ? "bg-indigo-600 text-white"
              : "bg-amber-50 border-b border-amber-100"
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${activeMatch.status === "in_progress" ? "text-white" : "text-amber-800"}`}>
                {activeMatch.status === "in_progress" ? "🚚 운송 중" : "✓ 매칭 완료 · 운송 대기"}
              </span>
            </div>
            <span className={`text-sm font-bold ${activeMatch.status === "in_progress" ? "text-indigo-100" : "text-amber-700"}`}>
              {formatKRW(Math.round(((activeMatch.orders as any)?.price || 0) * 0.96))}
            </span>
          </div>

          <div className="p-5">
            <div className="mb-1">
              <p className="font-semibold text-gray-900 text-sm">{(activeMatch.orders as any)?.title || "운송 의뢰"}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {(activeMatch.orders as any)?.origin} → {(activeMatch.orders as any)?.destination}
              </p>
            </div>

            {/* 카카오 지도 */}
            <div className="mt-4">
              <KakaoRouteMap
                origin={(activeMatch.orders as any)?.origin || ""}
                destination={(activeMatch.orders as any)?.destination || ""}
              />
            </div>

            {/* 액션 버튼 */}
            <div className="mt-3 flex gap-2">
              <Link href={`/chat/${activeMatch.id}`}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-center py-2.5 rounded-xl text-sm font-semibold transition-colors">
                💬 채팅하기
              </Link>
              <Link href="/driver/matches"
                className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-center rounded-xl text-sm font-semibold transition-colors">
                상세
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { href: "/driver/feed", icon: "📋", label: "의뢰 피드" },
          { href: "/driver/matches", icon: "🤝", label: "내 운송" },
          { href: "/driver/earnings", icon: "💳", label: "수익 현황" },
          { href: "/driver/profile", icon: "👤", label: "내 프로필" },
        ].map(a => (
          <Link key={a.href} href={a.href} className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:border-gray-300 transition-colors">
            <div className="text-xl mb-1">{a.icon}</div>
            <div className="text-xs text-gray-600 font-medium">{a.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent matches */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">최근 운송</h2>
          <Link href="/driver/matches" className="text-sm text-gray-400 hover:text-gray-700">전체 →</Link>
        </div>
        {matches && matches.length > 0 ? (
          <div className="space-y-2">
            {matches.slice(0, 3).map((match) => (
              <Link key={match.id} href={`/chat/${match.id}`}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors">
                <div className="flex-1 min-w-0">
                  {(match.orders as any)?.title && (
                    <div className="font-medium text-sm text-gray-900 truncate mb-0.5">{(match.orders as any).title}</div>
                  )}
                  <div className="text-xs text-gray-400 truncate">
                    {(match.orders as any)?.origin} → {(match.orders as any)?.destination}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-sm text-emerald-600">
                    {formatKRW(Math.round(((match.orders as any)?.price || 0) * 0.96))}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {match.status === "completed" ? "완료" : match.status === "in_progress" ? "진행 중" : "매칭됨"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon="🚛" title="운송 이력이 없습니다" description="의뢰 피드에서 의뢰를 수락해보세요"
            action={<Link href="/driver/feed" className="btn-primary px-5 py-2 rounded-lg text-sm inline-block">피드 보기</Link>}
          />
        )}
      </div>

      {/* New orders preview */}
      {pendingOrders && pendingOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">새 의뢰 <span className="text-indigo-500">{pendingOrders.length}건</span></h2>
            <Link href="/driver/feed" className="text-sm text-gray-400 hover:text-gray-700">피드 →</Link>
          </div>
          <div className="space-y-2">
            {pendingOrders.map(order => (
              <Link key={order.id} href={`/driver/orders/${order.id}`}
                className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {order.is_urgent && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">긴급</span>}
                    <span className="text-xs text-gray-400">{order.cargo_type}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-800 truncate">{order.origin} → {order.destination}</div>
                </div>
                <div className="font-semibold text-sm text-gray-900">{formatKRW(order.price)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
