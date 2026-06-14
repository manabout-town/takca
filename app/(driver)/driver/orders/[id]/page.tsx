import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { acceptOrder } from "@/app/actions/orders"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { calculateFee } from "@/lib/utils/format"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { MapPin, Package, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function DriverOrderDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from("orders")
    .select("*, shippers:users!shipper_id(*)")
    .eq("id", params.id)
    .single()

  if (!order) notFound()

  // Check if driver already accepted any order in this
  const { data: myMatch } = await supabase
    .from("matches")
    .select("id, status")
    .eq("order_id", params.id)
    .eq("driver_id", user!.id)
    .single()

  const { platformFee, driverPayout } = calculateFee(order.price, 0.04)
  const canAccept = order.status === "pending" && !myMatch && order.shipper_id !== user!.id

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/driver/feed" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← 의뢰 피드
      </Link>

      <div className="flex items-center gap-2 mb-4">
        {order.is_urgent && (
          <span className="badge bg-orange-100 text-orange-700">⚡ 긴급</span>
        )}
        <span className="badge bg-yellow-100 text-yellow-800">매칭 대기</span>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <h1 className="text-xl font-bold">운송 의뢰 상세</h1>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-blue-500 mt-0.5 shrink-0" size={18} />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">구간</div>
              <div className="font-semibold text-lg">{order.origin}</div>
              <div className="text-gray-400 text-sm my-0.5">↓</div>
              <div className="font-semibold text-lg">{order.destination}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="text-green-500 mt-0.5 shrink-0" size={18} />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">화물</div>
              <div className="font-semibold">{order.cargo_type}</div>
              {order.cargo_detail && <div className="text-sm text-gray-600 mt-1">{order.cargo_detail}</div>}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="text-purple-500 mt-0.5 shrink-0" size={18} />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">픽업 일시</div>
              <div className="font-semibold">{formatDate(order.pickup_at)}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 정산 예상 */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-bold flex items-center gap-2">
            <DollarSign size={16} /> 예상 수입
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">화주 희망 금액</span>
              <span className="font-medium">{formatKRW(order.price)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>플랫폼 수수료 (4%)</span>
              <span>- {formatKRW(platformFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>실수령 금액</span>
              <span className="text-blue-700">{formatKRW(driverPayout)}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {myMatch ? (
        <div className="text-center py-4">
          <div className="text-green-600 font-semibold mb-2">✓ 이미 수락한 의뢰입니다</div>
          <Link href={`/chat/${myMatch.id}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">
            채팅방 이동 →
          </Link>
        </div>
      ) : canAccept ? (
        <form action={acceptOrder.bind(null, order.id)}>
          <button type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-bold transition">
            이 의뢰 수락하기
          </button>
          <p className="text-xs text-center text-gray-500 mt-2">
            수락 즉시 화주와 채팅이 연결됩니다
          </p>
        </form>
      ) : (
        <div className="text-center text-gray-500 py-4 bg-gray-100 rounded-xl">
          {order.status !== "pending" ? "이미 매칭된 의뢰입니다" : "수락할 수 없는 의뢰입니다"}
        </div>
      )}
    </div>
  )
}
