import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/EmptyState"
import { RouteMap } from "@/components/shared/RouteMap"
import { formatKRW } from "@/lib/utils/format"
import Link from "next/link"

export default async function DriverDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user!.id)
    .single()

  const { data: driverProfile } = await supabase
    .from("driver_profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single()

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
  const activeMatches = matches?.filter(m => ["accepted", "in_progress"].includes(m.status)) || []
  const totalEarnings = matches
    ?.filter(m => m.status === "completed")
    .reduce((sum, m) => sum + ((m.orders as any)?.price || 0) * 0.96, 0) || 0
  const completionRate = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0
  const activeMatch = activeMatches[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">안녕하세요, {profile?.name || "기사"}님 👋</h1>
          <p className="text-gray-500 text-sm mt-1">화물로 기사 대시보드</p>
        </div>
        <Link
          href="/driver/feed"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
        >
          <span>🔍</span> 의뢰 피드
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "누적 운송", value: `${totalMatches}건`, icon: "🚛", color: "bg-blue-50 border-blue-100" },
          { label: "완료 운송", value: `${completedMatches}건`, icon: "✅", color: "bg-green-50 border-green-100" },
          { label: "완료율", value: `${completionRate}%`, icon: "📊", color: "bg-purple-50 border-purple-100" },
          { label: "총 수익", value: formatKRW(Math.round(totalEarnings)), icon: "💰", color: "bg-yellow-50 border-yellow-100" },
        ].map((stat) => (
          <div key={stat.label} className={`border rounded-xl p-4 ${stat.color}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Driver info card */}
      {driverProfile && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl">🚛</div>
              <div>
                <div className="font-bold text-lg">{profile?.name}</div>
                <div className="text-blue-200 text-sm">{driverProfile.vehicle_type} · {driverProfile.vehicle_number}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="font-semibold">{driverProfile.rating_avg?.toFixed(1) || "0.0"}</span>
                  <span className="text-blue-200 text-xs">({driverProfile.rating_count || 0}건)</span>
                  {driverProfile.is_verified && (
                    <span className="ml-2 bg-green-400/20 border border-green-400/30 text-green-300 text-xs px-2 py-0.5 rounded-full">✓ 인증됨</span>
                  )}
                </div>
              </div>
            </div>
            <Link href="/driver/profile" className="text-xs text-blue-200 hover:text-white">프로필 편집 →</Link>
          </div>
        </div>
      )}

      {/* Active match with route map */}
      {activeMatch && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">현재 진행 중인 운송</h2>
              {(activeMatch.orders as any)?.title && (
                <p className="text-sm text-gray-500">{(activeMatch.orders as any).title}</p>
              )}
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold">
              {activeMatch.status === "in_progress" ? "🔄 운송 중" : "✅ 매칭됨"}
            </span>
          </div>
          <RouteMap
            origin={(activeMatch.orders as any)?.origin || ""}
            destination={(activeMatch.orders as any)?.destination || ""}
          />
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">화물 종류</div>
              <div className="font-semibold">{(activeMatch.orders as any)?.cargo_type}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">수익 (4% 수수료 제외)</div>
              <div className="font-bold text-green-700">{formatKRW(Math.round(((activeMatch.orders as any)?.price || 0) * 0.96))}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">화주</div>
              <div className="font-semibold">{(activeMatch.orders as any)?.shippers?.name}</div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Link href={`/chat/${activeMatch.id}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-xl text-sm font-semibold transition-colors">
              💬 화주와 채팅
            </Link>
            <Link href={`/driver/matches`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2.5 rounded-xl text-sm font-semibold transition-colors">
              운송 상세보기
            </Link>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/driver/feed", icon: "📋", label: "의뢰 피드" },
          { href: "/driver/matches", icon: "🤝", label: "내 운송" },
          { href: "/driver/earnings", icon: "💳", label: "수익 현황" },
          { href: "/driver/profile", icon: "👤", label: "내 프로필" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-1.5">{action.icon}</div>
            <div className="text-sm font-medium text-gray-700">{action.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">최근 운송 이력</h2>
          <Link href="/driver/matches" className="text-sm text-blue-600 hover:text-blue-700 font-medium">전체 보기 →</Link>
        </div>
        {matches && matches.length > 0 ? (
          <div className="space-y-3">
            {matches.slice(0, 3).map((match) => (
              <Link
                key={match.id}
                href={`/chat/${match.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  {(match.orders as any)?.title && (
                    <div className="font-semibold text-sm text-gray-900 truncate mb-0.5">{(match.orders as any).title}</div>
                  )}
                  <div className="text-xs text-gray-500 truncate">
                    📍 {(match.orders as any)?.origin} → 📍 {(match.orders as any)?.destination}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    화주: {(match.orders as any)?.shippers?.name}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-green-700 text-sm">{formatKRW(Math.round(((match.orders as any)?.price || 0) * 0.96))}</div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    match.status === "completed" ? "bg-green-100 text-green-700" :
                    match.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {match.status === "completed" ? "완료" : match.status === "in_progress" ? "진행 중" : "매칭됨"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🚛"
            title="아직 운송 이력이 없습니다"
            description="의뢰 피드에서 원하는 의뢰를 수락해 보세요"
            action={
              <Link href="/driver/feed" className="btn-primary px-6 py-2.5 rounded-lg text-sm inline-block">
                의뢰 피드 보기
              </Link>
            }
          />
        )}
      </div>

      {/* New orders preview */}
      {pendingOrders && pendingOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">새로운 의뢰 <span className="text-blue-600">{pendingOrders.length}건</span></h2>
            <Link href="/driver/feed" className="text-sm text-blue-600 hover:text-blue-700 font-medium">피드 보기 →</Link>
          </div>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <Link
                key={order.id}
                href={`/driver/orders/${order.id}`}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {order.is_urgent && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">⚡ 긴급</span>}
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{order.cargo_type}</span>
                    {order.vehicle_type && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{order.vehicle_type}</span>}
                  </div>
                  <div className="text-xs font-medium text-gray-700 truncate">
                    {order.origin} → {order.destination}
                  </div>
                </div>
                <div className="font-bold text-blue-700 text-sm flex-shrink-0">{formatKRW(order.price)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
