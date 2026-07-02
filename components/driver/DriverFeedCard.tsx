import Link from "next/link"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { MapPin, Calendar, Car, Zap } from "lucide-react"
import { QuickAcceptButton } from "./QuickAcceptButton"

interface Order {
  id: string
  origin: string
  destination: string
  vehicle_count?: number
  vehicle_notes?: string
  price: number
  status: string
  is_urgent: boolean
  pickup_at: string
}

export function DriverFeedCard({ order }: { order: Order }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all duration-200">
      <Link href={`/driver/orders/${order.id}`} className="block p-5 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {order.is_urgent && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                <Zap size={10} /> 긴급
              </span>
            )}
          </div>
          <span className="text-base font-bold text-orange-500">{formatKRW(order.price)}</span>
        </div>

        <div className="space-y-2 mb-1">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <MapPin size={14} className="text-orange-400 shrink-0" />
            <span className="font-medium text-gray-800 truncate">{order.origin}</span>
            <span className="text-gray-300 shrink-0">→</span>
            <span className="font-medium text-gray-800 truncate">{order.destination}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Car size={13} /> 차량 {order.vehicle_count ?? 1}대
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={13} /> {formatDate(order.pickup_at)}
            </span>
          </div>
        </div>

        {order.vehicle_notes && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-2 pt-2 border-t border-gray-50">
            {order.vehicle_notes}
          </p>
        )}
      </Link>

      <div className="px-5 pb-4 flex items-center justify-between gap-3">
        <Link
          href={`/driver/orders/${order.id}`}
          className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
        >
          상세 보기 →
        </Link>
        <QuickAcceptButton orderId={order.id} price={order.price} />
      </div>
    </div>
  )
}
