import { createClient } from "@/lib/supabase/server"
import { CalendarView } from "@/components/shared/CalendarView"

export default async function ShipperCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from("orders")
    .select("id, origin, destination, pickup_at, price, status")
    .eq("shipper_id", user!.id)
    .not("pickup_at", "is", null)
    .in("status", ["pending", "matched", "in_progress", "completed"])
    .order("pickup_at", { ascending: true })

  const events = (orders || []).map((o: any) => ({
    id: o.id,
    date: o.pickup_at as string,
    title: `${o.origin} → ${o.destination}`,
    status: o.status as string,
    price: o.price as number,
    type: "order" as const,
    href: `/shipper/orders/${o.id}`,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">스케줄</h1>
          <p className="text-sm text-gray-400 mt-1">등록된 의뢰 일정</p>
        </div>
        <span className="text-xs text-orange-700 font-semibold bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">화주</span>
      </div>
      <CalendarView events={events} role="shipper" />
    </div>
  )
}
