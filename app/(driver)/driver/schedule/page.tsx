import { createClient } from "@/lib/supabase/server"
import { cancelSchedule, markScheduleFilled } from "@/app/actions/schedule"
import { ScheduleForm } from "./ScheduleForm"
import Link from "next/link"

const STATUS_LABEL: Record<string, string> = { active: "모집 중", filled: "마감", cancelled: "취소" }
const STATUS_STYLE: Record<string, string> = {
  active:    "bg-emerald-100 text-emerald-700",
  filled:    "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const days = ["일","월","화","수","목","금","토"]
  return `${d.getMonth()+1}/${d.getDate()}(${days[d.getDay()]})`
}

export default async function DriverSchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: dp }, { data: schedules }] = await Promise.all([
    supabase.from("driver_profiles").select("vehicle_type").eq("user_id", user!.id).single(),
    supabase.from("driver_schedules").select("*").eq("driver_id", user!.id)
      .order("available_date", { ascending: false }).limit(30),
  ])

  const active    = schedules?.filter(s => s.status === "active" && new Date(s.available_date) >= new Date()) || []
  const past      = schedules?.filter(s => s.status !== "active" || new Date(s.available_date) < new Date()) || []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">가용 일정 관리</h1>
          <p className="text-base text-gray-400 mt-2">운송 가능한 날짜와 지역을 등록하세요</p>
        </div>
        <Link href="/driver/dashboard" className="text-sm text-gray-400 hover:text-gray-700 mt-1">← 대시보드</Link>
      </div>

      {/* 등록 폼 */}
      <ScheduleForm defaultVehicleType={dp?.vehicle_type} />

      {/* 활성 일정 */}
      {active.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">등록된 가용 일정 ({active.length}건)</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {active.map((s: any) => (
              <div key={s.id} className="px-5 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{formatDate(s.available_date)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[s.status]}`}>
                        {STATUS_LABEL[s.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      출발: <span className="font-medium">{s.origin_city}</span>
                      {s.origin_detail && ` · ${s.origin_detail}`}
                    </p>
                  </div>
                  {s.vehicle_type && (
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium border border-indigo-100">
                      {s.vehicle_type}
                    </span>
                  )}
                </div>

                {/* 도착 가능 지역 */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {s.dest_regions.slice(0, 8).map((r: string) => (
                    <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r}</span>
                  ))}
                  {s.dest_regions.length > 8 && (
                    <span className="text-xs text-gray-400">+{s.dest_regions.length - 8}개</span>
                  )}
                </div>

                {s.memo && <p className="text-xs text-gray-400 mb-3">{s.memo}</p>}

                <div className="flex gap-2">
                  <form action={async () => { "use server"; await markScheduleFilled(s.id) }}>
                    <button type="submit"
                      className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium">
                      마감 처리
                    </button>
                  </form>
                  <form action={async () => { "use server"; await cancelSchedule(s.id) }}>
                    <button type="submit"
                      className="text-xs px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
                      취소
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 지난/취소 일정 */}
      {past.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-500 text-sm">지난 일정</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {past.slice(0, 10).map((s: any) => (
              <div key={s.id} className="px-5 py-3.5 flex items-center justify-between opacity-60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{formatDate(s.available_date)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{s.origin_city} → {s.dest_regions.slice(0, 3).join(", ")}{s.dest_regions.length > 3 ? ` 외 ${s.dest_regions.length - 3}곳` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
