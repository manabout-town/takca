import Link from "next/link"
import type { Order } from "@/lib/types"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/utils/status"
import { MapPin, Calendar, Package, Zap } from "lucide-react"

interface OrderCardProps {
  order: Order
  href: string
  showStatus?: boolean
}

export function OrderCard({ order, href, showStatus = true }: OrderCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 hover:shadow-sm transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {order.is_urgent && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                <Zap size={10} /> 긴급
              </span>
            )}
            {showStatus && (
              <span className={`badge ${ORDER_STATUS_COLOR[order.status]}`}>
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            )}
          </div>
          <span className="text-base font-bold text-orange-500">{formatKRW(order.price)}</span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-orange-400 shrink-0" />
            <span className="font-medium text-gray-800">{order.origin}</span>
            <span className="text-gray-300">→</span>
            <span className="font-medium text-gray-800">{order.destination}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Package size={13} /> {order.cargo_type}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={13} /> {formatDate(order.pickup_at)}
            </span>
          </div>
        </div>

        {order.cargo_detail && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-2 pt-2 border-t border-gray-50">{order.cargo_detail}</p>
        )}
      </div>
    </Link>
  )
}
