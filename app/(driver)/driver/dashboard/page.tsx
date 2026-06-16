import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/EmptyState"
import { RouteMap } from "@/components/shared/RouteMap"
import { DriverRankBadge } from "@/components/shared/DriverRankBadge"
import { LocationTracker } from "@/components/driver/LocationTracker"
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
    <div className="space-y-8">
      <LocationTracker
        driverId={user!.id}
        matchId={activeMatch?.id ?? null}
        active={activeMatch?.status === "in_progress"}
      />
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {profile?.name || "기사"}님, 안녕하세요
          </h1>
          <div className="mt-2">
            <DriverRankBadge completedCount={completedMatches} size="sm" showProgress={false} />
          </div>
        </div>
        <Link href="/driver/feed"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0 mt-1">
          의뢰 피드
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "누적 운송", value: `${totalMatches}건`, accent: false },
          { label: "완료", value: `${completedMatches}건`, accent: completedMatches > 0 },
          { label: "완료율", value: `${completionRate}%`, accent: false },
          { label: "총 수익", value: formatKRW(Math.round(totalEarnings)), accent: totalEarnings > 0 },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-6 border ${s.accent ? "bg-indigo-50 border-indigo-100" : "bg-white border-gray-100"}`}>
            <div className={`text-3xl font-bold tracking-tight ${s.accent ? "text-indigo-600" : "text-gray-900"}`}>{s.value}</div>
            <div className="text-sm text-gray-400 mt-1.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Driver profile card */}
      {driverProfile && (
        <div className="bg-gray-950 rounded-2xl p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center text-3xl">🚛</div>
            <div>
              <div className="font-bold text-lg">{profile?.name}</div>
              <div className="text-gray-400 mt-0.5">{driverProfile.vehicle_type} · {driverProfile.vehicle_number}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-amber-400 text-sm">★ {driverProfile.rating_avg?.toFixed(1) || "0.0"}</span>
                <span className="text-gray-500 text-sm">({driverProfile.rating_count || 0}건)</span>
                {driverProfile.is_verified && <span className="text-indigo-400 text-sm">· ✓ 인증</span>}
              </div>
            </div>
          </div>
          <Link href="/driver/mypage" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">편집 →</Link>
        </div>
      )}

      {/* Active match with route map */}
      {activeMatch && (
        <div className="bg-white border border-indigo-100 rounded-2xl overflow-hidden ring-1 ring-indigo-200/50">
          <div className={`px-6 py-4 flex items-center justify-between ${
            activeMatch.status === "in_progress"
              ? "bg-indigo-600 text-white"
              : "bg-indigo-50 border-b border-indigo-100"
          }`}>
            <span className={`font-bold ${activeMatch.status === "in_progress" ? "text-white" : "text-indigo-800"}`}>
              {activeMatch.status === "in_progress" ? "🚚 운송 중" : "✓ 매칭 완료 · 운송 대기"}
            </span>
            <span className={`text-lg font-bold ${activeMatch.status === "in_progress" ? "text-indigo-100" : "text-indigo-600"}`}>
              {formatKRW(Math.round(((activeMatch.orders as any)?.price || 0) * 0.96))}
            </span>
          </div>
          <div className="p-6">
            <p className="font-bold text-gray-900 text-lg mb-1">{(activeMatch.orders as any)?.title || "운송 의뢰"}</p>
            <p className="text-sm text-gray-400">
              {(activeMatch.orders as any)?.origin} → {(activeMatch.orders as any)?.destination}
            </p>
            <div className="mt-5">
              <RouteMap
                origin={(activeMatch.orders as any)?.origin || ""}
                destination={(activeMatch.orders as any)?.destination || ""}
              />
            </div>
            <div className="mt-4 flex gap-3">
              <Link href={`/chat/${activeMatch.id}`}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-xl font-semibold transition-colors">
                💬 채팅하기
              </Link>
              <Link href="/driver/matches"
                className="px-5 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-center rounded-xl font-semibold transition-colors">
                상세
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { href: "/driver/feed", icon: "📋", label: "의뢰 피드" },
          { href: "/driver/matches", icon: "🤝", label: "내 운송" },
          { href: "/driver/wallet", icon: "💳", label: "수익 현황" },
          { href: "/driver/mypage", icon: "👤", label: "내 프로필" },
        ].map(a => (
          <Link key={a.href} href={a.href}
            className="bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
            <div className="text-2xl mb-2">{a.icon}</div>
            <div className="text-sm text-gray-600 font-medium">{a.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">최근 운송</h2>
          <Link href="/driver/matches" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors">전체 →</Link>
        </div>
        {matches && matches.length > 0 ? (
          <div className="space-y-3">
            {matches.slice(0, 3).map((match) => (
              <Link key={match.id} href={`/chat/${match.id}`}
                className="flex items-center gap-5 bg-white border border-gray-100 rounded-2xl p-5 hover:border-indigo-200 transition-colors">
                <div className="flex-1 min-w-0">
                  {(match.orders as any)?.title && (
                    <div className="font-semibold text-gray-900 truncate mb-1">{(match.orders as any).title}</div>
                  )}
                  <div className="text-sm text-gray-400 truncate">
                    {(match.orders as any)?.origin} → {(match.orders as any)?.destination}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-indigo-600">
                    {formatKRW(Math.round(((match.orders as any)?.price || 0) * 0.96))}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {match.status === "completed" ? "완료" : match.status === "in_progress" ? "진행 중" : "매칭됨"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon="🚛" title="운송 이력이 없습니다" description="의뢰 피드에서 의뢰를 수락해보세요"
            action={<Link href="/driver/feed" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-block">피드 보기</Link>}
          />
        )}
      </div>

      {/* New orders preview */}
      {pendingOrders && pendingOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">새 의뢰 <span className="text-indigo-500">{pendingOrders.length}건</span></h2>
            <Link href="/driver/feed" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors">피드 →</Link>
          </div>
          <div className="space-y-3">
            {pendingOrders.map(order => (
              <Link key={order.id} href={`/driver/orders/${order.id}`}
                className="flex items-center gap-5 bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:border-indigo-200 hover:bg-white transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {order.is_urgent && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">⚡ 긴급</span>}
                    <span className="text-sm text-gray-400">{order.cargo_type}</span>
                  </div>
                  <div className="font-medium text-gray-800 truncate">{order.origin} → {order.destination}</div>
                </div>
                <div className="font-bold text-indigo-600">{formatKRW(order.price)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
