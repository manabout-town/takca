import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/utils/status"
import { cancelOrder, confirmCompletion } from "@/app/actions/orders"
import { approveBid, rejectBid } from "@/app/actions/bids"

export default async function ShipperOrderDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: order }, { data: bids }] = await Promise.all([
    supabase.from("orders").select(`
      *,
      matches(*, drivers:users!driver_id(*, driver_profiles(vehicle_type, vehicle_number, home_region, route_regions, rating_avg, rating_count)))
    `).eq("id", params.id).eq("shipper_id", user!.id).single(),
    supabase.from("bids").select(`*, drivers:users!driver_id(name, phone, driver_profiles(vehicle_type, vehicle_number, home_region, route_regions, rating_avg))`).eq("order_id", params.id).order("created_at", { ascending: true }),
  ])

  if (!order) notFound()

  const activeMatch = order.matches?.find((m: any) => !["cancelled"].includes(m.status))
  const pendingBids = bids?.filter((b: any) => b.status === "pending") || []
  const acceptedBid = bids?.find((b: any) => b.status === "accepted")

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/shipper/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">← 내 의뢰</Link>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLOR[order.status as keyof typeof ORDER_STATUS_COLOR] || "bg-gray-100 text-gray-700"}`}>
          {ORDER_STATUS_LABEL[order.status as keyof typeof ORDER_STATUS_LABEL]}
        </span>
        {order.is_urgent && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">⚡ 긴급</span>}
      </div>

      {/* 의뢰 정보 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold mb-4">{order.title || "운송 의뢰"}</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-gray-500 mb-1">출발지</p><p className="font-semibold">{order.origin}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">도착지</p><p className="font-semibold">{order.destination}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">화물 종류</p><p className="font-medium">{order.cargo_type}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">필요 차량</p><p className="font-medium">{order.vehicle_type || "무관"}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">희망 운임</p><p className="font-bold text-indigo-700">{formatKRW(order.price)}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">픽업 일시</p><p className="font-medium">{formatDate(order.pickup_at)}</p></div>
        </div>
      </div>

      {/* 입찰 목록 (pending 상태일 때) */}
      {order.status === "pending" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">
            입찰 현황 <span className="text-indigo-600 ml-1">{pendingBids.length}건</span>
          </h2>

          {pendingBids.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-2xl mb-2">🕐</p>
              <p className="text-sm">아직 입찰한 기사가 없습니다</p>
              <p className="text-xs mt-1">기사들이 의뢰를 확인하고 입찰할 거예요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBids.map((bid: any) => {
                const dp = bid.drivers?.driver_profiles
                return (
                  <div key={bid.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{bid.drivers?.name}</p>
                        <p className="text-xs text-gray-500">{dp?.vehicle_type} · {dp?.vehicle_number}</p>
                        {dp?.home_region && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            📍 {dp.home_region}
                            {dp.route_regions?.length > 0 && ` · 운송루트: ${dp.route_regions.join(", ")}`}
                          </p>
                        )}
                        {dp?.rating_avg > 0 && (
                          <p className="text-xs text-amber-500 mt-0.5">★ {dp.rating_avg.toFixed(1)}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-700 text-lg">{formatKRW(bid.price)}</p>
                        <p className="text-xs text-gray-400">{formatDate(bid.created_at)}</p>
                      </div>
                    </div>
                    {bid.message && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-3">{bid.message}</p>
                    )}
                    <div className="flex gap-2">
                      <form action={async () => { "use server"; await approveBid(bid.id, order.id) }} className="flex-1">
                        <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                          ✓ 승인하기
                        </button>
                      </form>
                      <form action={async () => { "use server"; await rejectBid(bid.id, order.id) }}>
                        <button type="submit" className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                          거절
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 매칭된 기사 정보 */}
      {activeMatch && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <h2 className="font-bold text-emerald-800 mb-3">✓ 매칭된 기사</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-lg">🚛</div>
            <div>
              <p className="font-semibold">{activeMatch.drivers?.name}</p>
              <p className="text-sm text-gray-600">{activeMatch.drivers?.driver_profiles?.vehicle_type} · {activeMatch.drivers?.driver_profiles?.vehicle_number}</p>
              <p className="text-sm text-gray-500">{activeMatch.drivers?.phone}</p>
            </div>
          </div>
          {["accepted","in_progress"].includes(activeMatch.status) && (
            <Link href={`/chat/${activeMatch.id}`} className="mt-4 flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
              💬 기사와 채팅하기
            </Link>
          )}
        </div>
      )}

      {/* 완료 확인 / 취소 버튼 */}
      {order.status === "in_progress" && (
        <form action={async () => { "use server"; await confirmCompletion(params.id) }}>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
            운송 완료 확인
          </button>
        </form>
      )}
      {order.status === "pending" && (
        <form action={async () => { "use server"; await cancelOrder(params.id) }}>
          <button type="submit" className="w-full py-2 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            의뢰 취소
          </button>
        </form>
      )}
    </div>
  )
}
