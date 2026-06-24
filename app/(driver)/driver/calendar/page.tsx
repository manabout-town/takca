import { createClient } from "@/lib/supabase/server"
import { CalendarView } from "@/components/shared/CalendarView"

export default async function DriverCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from("matches")
    .select("id, status, orders!inner(id, origin, destination, pickup_at, price)")
    .eq("driver_id", user!.id)
    .in("status", ["accepted", "in_progress", "completed"])
    .not("orders.pickup_at", "is", null)

  const events = (matches || []).map((m: any) => ({
    id: m.id,
    date: m.orders.pickup_at as string,
    title: `${m.orders.origin} → ${m.orders.destination}`,
    status: m.status as string,
    price: m.orders.price as number,
    type: "match" as const,
    href: `/driver/matches`,
  }))

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">스케줄</h1>
          <p className="text-sm text-gray-400 mt-1">배정된 운송 일정</p>
        </div>
        <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full shrink-0">기사</span>
      </div>
      <div className="overflow-x-auto">
        <CalendarView events={events} role="driver" />
      </div>
    </div>
  )
}
