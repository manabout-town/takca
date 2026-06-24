import { createClient } from "@/lib/supabase/server"
import { formatKRW, formatDate } from "@/lib/utils/format"
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
    { label: "총 회원", value: `${totalUsers || 0}명`, icon: "👥", accent: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
    { label: "총 의뢰", value: `${totalOrders || 0}건`, icon: "📦", accent: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
    { label: "대기 중", value: `${pendingOrders || 0}건`, icon: "⏳", accent: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
    { label: "완료", value: `${completedOrders || 0}건`, icon: "✅", accent: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { label: "누적 수수료", value: formatKRW(totalRevenue), icon: "💰", accent: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
    { label: "에스크로 보관", value: formatKRW(heldAmount), icon: "🔒", accent: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">관리자 대시보드</h1>
          <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2">플랫폼 현황 모니터링</p>
        </div>
        <div className="flex items-center gap-2 mt-1 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl shrink-0 ml-3">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-sm text-emerald-600 font-medium">실시간</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4 md:p-6`}>
            <div className="text-xl md:text-2xl mb-2 md:mb-3">{s.icon}</div>
            <div className={`text-xl md:text-3xl font-bold tracking-tight ${s.accent}`}>{s.value}</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1 md:mt-1.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">최근 의뢰</h2>
            <Link href="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600 font-medium">전체 보기 →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders?.map((o: any) => (
              <div key={o.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">{o.origin} → {o.destination}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{o.shippers?.name} · {formatDate(o.created_at)}</div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className="font-bold text-orange-500">{formatKRW(o.price)}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                    o.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                    o.status === "pending" ? "bg-amber-100 text-amber-700" :
                    "bg-indigo-100 text-indigo-700"
                  }`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Disputes */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              분쟁 관리
              {disputes && disputes.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  {disputes.length}
                </span>
              )}
            </h2>
            <Link href="/admin/disputes" className="text-sm text-orange-500 hover:text-orange-600 font-medium">전체 보기 →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {!disputes || disputes.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400">미해결 분쟁 없음 ✓</div>
            ) : (
              disputes.map((d: any) => (
                <div key={d.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-red-600">분쟁 신고</div>
                    <div className="text-sm text-gray-500 mt-0.5 line-clamp-1">{d.reason}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatDate(d.created_at)}</div>
                  </div>
                  <Link
                    href={`/admin/disputes/${d.id}`}
                    className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl font-semibold transition-colors shrink-0"
                  >
                    처리
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
