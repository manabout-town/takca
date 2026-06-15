import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { RouteMap } from "@/components/shared/RouteMap"
import { formatKRW } from "@/lib/utils/format"
import Link from "next/link"

const STATUS_LABEL: Record<string, string> = {
  pending: "매칭 대기",
  matched: "매칭 완료",
  in_progress: "운송 중",
  completed: "완료",
  cancelled: "취소",
  disputed: "분쟁",
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  matched: "bg-blue-100 text-blue-700",
  in_progress: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  disputed: "bg-red-100 text-red-700",
}

export default async function ShipperDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user!.id)
    .single()

  const { data: orders } = await supabase
    .from("orders")
    .select("*, matches(id, status, drivers:users!driver_id(name, phone))")
    .eq("shipper_id", user!.id)
    .order("created_at", { ascending: false })

  const totalOrders = orders?.length || 0
  const activeOrders = orders?.filter(o => ["pending", "matched", "in_progress"].includes(o.status)).length || 0
  const completedOrders = orders?.filter(o => o.status === "completed").length || 0
  const totalSpent = orders?.filter(o => o.status === "completed").reduce((sum, o) => sum + (o.price || 0), 0) || 0
  const activeOrder = orders?.find(o => o.status === "in_progress" || o.status === "matched")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">안녕하세요, {profile?.name || "화주"}님 👋</h1>
          <p className="text-gray-500 text-sm mt-1">화물로 화주 대시보드</p>
        </div>
        <Link
          href="/shipper/orders/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
        >
          <span>+</span> 의뢰 등록
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "전체 의뢰", value: totalOrders.toString(), icon: "📋", color: "bg-blue-50 border-blue-100" },
          { label: "진행 중", value: activeOrders.toString(), icon: "🔄", color: "bg-orange-50 border-orange-100" },
          { label: "완료", value: completedOrders.toString(), icon: "✅", color: "bg-green-50 border-green-100" },
          { label: "총 거래액", value: formatKRW(totalSpent), icon: "💰", color: "bg-purple-50 border-purple-100" },
        ].map((stat) => (
          <div key={stat.label} className={`border rounded-xl p-4 ${stat.color}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active order with route map */}
      {activeOrder && (
        <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">현재 진행 중인 운송</h2>
              {activeOrder.title && <p className="text-sm text-gray-500">{activeOrder.title}</p>}
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${STATUS_STYLE[activeOrder.status]}`}>
              {STATUS_LABEL[activeOrder.status]}
            </span>
          </div>
          <RouteMap origin={activeOrder.origin} destination={activeOrder.destination} />
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">화물 종류</div>
              <div className="font-semibold">{activeOrder.cargo_type}</div>
              {activeOrder.vehicle_type && <div className="text-xs text-blue-600 mt-0.5">🚛 {activeOrder.vehicle_type}</div>}
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">운임</div>
              <div className="font-bold text-blue-700">{formatKRW(activeOrder.price)}</div>
              {activeOrder.is_urgent && <div className="text-xs text-orange-500 mt-0.5">⚡ 긴급</div>}
            </div>
          </div>
          {activeOrder.matches?.[0] && (
            <div className="mt-3 bg-blue-50 rounded-xl p-3 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-500">배정 기사:</span>{" "}
                <span className="font-semibold">{(activeOrder.matches[0] as any).drivers?.name}</span>
              </div>
              <Link href={`/chat/${activeOrder.matches[0].id}`} className="text-xs text-blue-600 font-medium hover:text-blue-700">
                채팅하기 →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/shipper/orders/new", icon: "📝", label: "의뢰 등록" },
          { href: "/shipper/orders", icon: "📋", label: "의뢰 목록" },
          { href: "/shipper/matches", icon: "🤝", label: "매칭 현황" },
          { href: "/shipper/wallet", icon: "💳", label: "에스크로 지갑" },
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

      {/* Order list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">최근 의뢰 현황</h2>
          <Link href="/shipper/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">전체 보기 →</Link>
        </div>

        {!orders || orders.length === 0 ? (
          <EmptyState
            icon="📋"
            title="등록된 의뢰가 없습니다"
            description="첫 번째 의뢰를 등록해 보세요"
            action={
              <Link href="/shipper/orders/new" className="btn-primary px-6 py-2.5 rounded-lg text-sm inline-block">
                의뢰 등록하기
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/shipper/orders/${order.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {order.title && <span className="font-semibold text-sm text-gray-900 truncate">{order.title}</span>}
                    {order.is_urgent && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">⚡ 긴급</span>}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    📍 {order.origin} → 📍 {order.destination}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{order.cargo_type}{order.vehicle_type ? ` · ${order.vehicle_type}` : ""}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-blue-700 text-sm">{formatKRW(order.price)}</div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
