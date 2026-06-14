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
    { label: "총 회원", value: `${totalUsers || 0}명`, icon: "👥", color: "text-blue-600" },
    { label: "총 의뢰", value: `${totalOrders || 0}건`, icon: "📦", color: "text-indigo-600" },
    { label: "대기 중", value: `${pendingOrders || 0}건`, icon: "⏳", color: "text-yellow-600" },
    { label: "완료", value: `${completedOrders || 0}건`, icon: "✅", color: "text-green-600" },
    { label: "누적 수수료", value: formatKRW(totalRevenue), icon: "💰", color: "text-emerald-600" },
    { label: "에스크로 보관", value: formatKRW(heldAmount), icon: "🔒", color: "text-purple-600" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <div className="text-sm text-gray-500">실시간 현황</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(s => (
          <Card key={s.label}>
            <CardBody className="text-center py-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`font-bold text-lg ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="font-bold">최근 의뢰</h2>
              <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">전체 보기</Link>
            </div>
          </CardHeader>
          <div className="divide-y">
            {recentOrders?.map((o: any) => (
              <div key={o.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{o.origin} → {o.destination}</div>
                  <div className="text-xs text-gray-500">{o.shippers?.name} | {formatDate(o.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-blue-700">{formatKRW(o.price)}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    o.status === "completed" ? "bg-green-100 text-green-700" :
                    o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
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
              <h2 className="font-bold flex items-center gap-2">
                분쟁 관리
                {disputes && disputes.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {disputes.length}
                  </span>
                )}
              </h2>
              <Link href="/admin/disputes" className="text-sm text-blue-600 hover:underline">전체 보기</Link>
            </div>
          </CardHeader>
          <div className="divide-y">
            {!disputes || disputes.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">미해결 분쟁 없음 ✓</div>
            ) : (
              disputes.map((d: any) => (
                <div key={d.id} className="px-6 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-red-600">분쟁 신고</div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{d.reason}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatDate(d.created_at)}</div>
                    </div>
                    <Link href={`/admin/disputes/${d.id}`}
                      className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-100">
                      처리
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
