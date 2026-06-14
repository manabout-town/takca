import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/utils/status"
import { cancelOrder, confirmCompletion } from "@/app/actions/orders"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { MapPin, Package, Calendar, User, MessageCircle } from "lucide-react"

export default async function ShipperOrderDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from("orders")
    .select(`*, matches(*, drivers:users(*), driver_profiles(*))`)
    .eq("id", params.id)
    .eq("shipper_id", user!.id)
    .single()

  if (!order) notFound()

  const activeMatch = order.matches?.find(
    (m: any) => !["cancelled"].includes(m.status)
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/shipper/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">
          ← 내 의뢰
        </Link>
        <span className={`badge ${ORDER_STATUS_COLOR[order.status as keyof typeof ORDER_STATUS_COLOR]}`}>
          {ORDER_STATUS_LABEL[order.status as keyof typeof ORDER_STATUS_LABEL]}
        </span>
        {order.is_urgent && (
          <span className="badge bg-orange-100 text-orange-700">⚡ 긴급</span>
        )}
      </div>

      <Card className="mb-4">
        <CardHeader>
          <h1 className="text-xl font-bold">운송 의뢰 상세</h1>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-blue-500 mt-0.5 shrink-0" size={18} />
            <div>
              <div className="text-sm text-gray-500">구간</div>
              <div className="font-semibold">{order.origin} → {order.destination}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="text-green-500 mt-0.5 shrink-0" size={18} />
            <div>
              <div className="text-sm text-gray-500">화물</div>
              <div className="font-semibold">{order.cargo_type}</div>
              {order.cargo_detail && <div className="text-sm text-gray-600 mt-1">{order.cargo_detail}</div>}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="text-purple-500 mt-0.5 shrink-0" size={18} />
            <div>
              <div className="text-sm text-gray-500">픽업 일시</div>
              <div className="font-semibold">{formatDate(order.pickup_at)}</div>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">희망 금액</span>
              <span className="text-xl font-bold text-blue-700">{formatKRW(order.price)}</span>
            </div>
            {order.is_urgent && (
              <div className="flex justify-between items-center mt-1 text-sm">
                <span className="text-orange-600">긴급 부스팅</span>
                <span className="text-orange-600">+{formatKRW(order.urgent_fee)}</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Matched driver */}
      {activeMatch && (
        <Card className="mb-4">
          <CardHeader>
            <h2 className="font-bold flex items-center gap-2">
              <User size={16} /> 매칭된 기사
            </h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{activeMatch.drivers?.name}</div>
                <div className="text-sm text-gray-500">
                  {activeMatch.driver_profiles?.vehicle_type} | {activeMatch.driver_profiles?.vehicle_number}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium">
                    {activeMatch.driver_profiles?.rating_avg?.toFixed(1) || "신규"}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({activeMatch.driver_profiles?.rating_count || 0}건)
                  </span>
                </div>
              </div>
              <Link
                href={`/chat/${activeMatch.id}`}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                <MessageCircle size={16} /> 채팅
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {order.status === "pending" && (
          <form action={cancelOrder.bind(null, order.id)} className="flex-1">
            <button type="submit" className="btn-danger w-full py-2.5 rounded-lg text-sm">
              의뢰 취소
            </button>
          </form>
        )}
        {activeMatch && order.status === "in_progress" && (
          <form action={confirmCompletion.bind(null, activeMatch.id)} className="flex-1">
            <button type="submit" className="btn-primary w-full py-2.5 rounded-lg text-sm">
              ✓ 운송 완료 확인
            </button>
          </form>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-400 text-center">
        의뢰 등록일: {formatDate(order.created_at)}
      </div>
    </div>
  )
}
