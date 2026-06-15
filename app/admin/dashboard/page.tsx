import { createClient } from "@/lib/supabase/server"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import Link from "next/link"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalOrders },
    { count: pendingOrders },
    { count: completedOrders },
    { data: escrows },
    { data: recentOrders },
    { data: disputes },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("escrow").select("total_amount, platform_fee, status"),
    supabase.from("orders").select("*, shippers:users!shipper_id(name)").order("created_at", { ascending: false }).limit(10),
    supabase.from("disputes").select("*, match:matches(order_id)").eq("status", "open").limit(5),
  ])

  const totalRevenue = escrows?.filter(e => e.status === "released")
    .reduce((s, e) => s + (e.platform_fee || 0), 0) || 0
  const heldAmount = escrows?.filter(e => e.status === "held")
    .reduce((s, e) => s + (e.total_amount || 0), 0) || 0

  const stats = [
    { label: "총 회원", value: `${totalUsers || 0}명`, icon: "👥", color: "text-indigo-600" },
    { label: "총 의뢰", value: `${totalOrders || 0}건`, icon: "📦", color: "text-indigo-600" },
    { label: "대기 중", value: `${pendingOrders || 0}건`, icon: "⏳", color: "text-amber-600" },
    { label: "완료", value: `${completedOrders || 0}건`, icon: "✅", color: "text-emerald-600" },
    { label: "누적 수수료", value: formatKRW(totalRevenue), icon: "💰", color: "text-emerald-600" },
    { label: "에스크로 보관", value: formatKRW(heldAmount), icon: "🔒", color: "text-indigo-600" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
        <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">실시간 현황</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map(s => (
          <Card key={s.label}>
            <CardBody className="text-center py-4 px-3">
              <div className="text-xl mb-1.5">{s.icon}</div>
              <div className={`font-bold text-base ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">최근 의뢰</h2>
              <Link href="/admin/orders" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">전체 보기 →</Link>
            </div>
          </CardHeader>
          <div className="divide-y divide-gray-50">
            {recentOrders?.map((o: any) => (
              <div key={o.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-800 truncate">{o.origin} → {o.destination}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{o.shippers?.name} · {formatDate(o.created_at)}</div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className="text-sm font-semibold text-indigo-600">{formatKRW(o.price)}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5 inline-block ${
                    o.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                    o.status === "pending" ? "bg-amber-100 text-amber-700" :
                    "bg-indigo-100 text-indigo-700"
                  }`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Open Disputes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                분쟁 관리
                {disputes && disputes.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    {disputes.length}
                  </span>
                )}
              </h2>
              <Link href="/admin/disputes" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">전체 보기 →</Link>
            </div>
          </CardHeader>
          <div className="divide-y divide-gray-50">
            {!disputes || disputes.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">미해결 분쟁 없음 ✓</div>
            ) : (
              disputes.map((d: any) => (
                <div key={d.id} className="px-5 py-3 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-red-600">분쟁 신고</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{d.reason}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatDate(d.created_at)}</div>
                  </div>
                  <Link
                    href={`/admin/disputes/${d.id}`}
                    className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0"
                  >
                    처리
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
