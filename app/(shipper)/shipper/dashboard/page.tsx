import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/EmptyState"
import { RouteMap } from "@/components/shared/RouteMap"
import { formatKRW } from "@/lib/utils/format"
import Link from "next/link"

const STATUS_LABEL: Record<string, string> = {
  pending: "대기 중", matched: "매칭됨", in_progress: "운송 중",
  completed: "완료", cancelled: "취소", disputed: "분쟁",
}
const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400", matched: "bg-indigo-400", in_progress: "bg-indigo-500",
  completed: "bg-emerald-400", cancelled: "bg-gray-300", disputed: "bg-red-400",
}

export default async function ShipperDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("users").select("*").eq("id", user!.id).single()
  const { data: orders } = await supabase
    .from("orders")
    .select("*, matches(id, status, drivers:users!driver_id(name, phone))")
    .eq("shipper_id", user!.id)
    .order("created_at", { ascending: false })

  const totalOrders = orders?.length || 0
  const activeOrders = orders?.filter(o => ["pending","matched","in_progress"].includes(o.status)).length || 0
  const completedOrders = orders?.filter(o => o.status === "completed").length || 0
  const totalSpent = orders?.filter(o => o.status === "completed").reduce((s, o) => s + (o.price || 0), 0) || 0
  const activeOrder = orders?.find(o => ["in_progress","matched"].includes(o.status))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{profile?.name || "화주"}님, 안녕하세요</h1>
          <p className="text-sm text-gray-400 mt-0.5">화주 대시보드</p>
        </div>
        <Link href="/shipper/orders/new" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          + 의뢰 등록
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "전체 의뢰", value: totalOrders, suffix: "건" },
          { label: "진행 중", value: activeOrders, suffix: "건" },
          { label: "완료", value: completedOrders, suffix: "건" },
          { label: "총 거래액", value: formatKRW(totalSpent), suffix: "" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{s.value}{s.suffix}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active order with route map */}
      {activeOrder && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{activeOrder.title || "진행 중인 운송"}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[activeOrder.status]}`}></span>
                <span className="text-xs text-gray-500">{STATUS_LABEL[activeOrder.status]}</span>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900">{formatKRW(activeOrder.price)}</span>
          </div>
          <RouteMap origin={activeOrder.origin} destination={activeOrder.destination} />
          {activeOrder.matches?.[0] && (
            <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <span className="text-sm text-gray-600">
                배정 기사: <span className="font-semibold text-gray-900">{(activeOrder.matches[0] as any).drivers?.name}</span>
              </span>
              <Link href={`/chat/${activeOrder.matches[0].id}`} className="text-xs font-medium text-gray-900 hover:underline">채팅 →</Link>
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { href: "/shipper/orders/new", icon: "📝", label: "의뢰 등록" },
          { href: "/shipper/orders", icon: "📋", label: "의뢰 목록" },
          { href: "/shipper/matches", icon: "🤝", label: "매칭 현황" },
          { href: "/shipper/wallet", icon: "💳", label: "에스크로" },
        ].map(a => (
          <Link key={a.href} href={a.href} className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:border-gray-300 transition-colors">
            <div className="text-xl mb-1">{a.icon}</div>
            <div className="text-xs text-gray-600 font-medium">{a.label}</div>
          </Link>
        ))}
      </div>

      {/* Order list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">최근 의뢰</h2>
          <Link href="/shipper/orders" className="text-sm text-gray-400 hover:text-gray-700">전체 →</Link>
        </div>
        {!orders || orders.length === 0 ? (
          <EmptyState icon="📋" title="등록된 의뢰가 없습니다" description="첫 번째 의뢰를 등록해보세요"
            action={<Link href="/shipper/orders/new" className="btn-primary px-5 py-2 rounded-lg text-sm inline-block">의뢰 등록하기</Link>}
          />
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <Link key={order.id} href={`/shipper/orders/${order.id}`}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {order.title && <span className="font-medium text-sm text-gray-900 truncate">{order.title}</span>}
                    {order.is_urgent && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">긴급</span>}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{order.origin} → {order.destination}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-sm text-gray-900">{formatKRW(order.price)}</div>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[order.status] || "bg-gray-300"}`}></span>
                    <span className="text-[10px] text-gray-400">{STATUS_LABEL[order.status]}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
