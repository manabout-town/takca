"use client"
import { useState, useMemo } from "react"
import Link from "next/link"

interface CalendarEvent {
  id: string
  date: string
  title: string
  status: string
  price: number
  type: "order" | "match"
  href: string
}

interface Props {
  events: CalendarEvent[]
  role: "shipper" | "driver"
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

const STATUS_COLOR: Record<string, string> = {
  pending:     "bg-amber-400",
  matched:     "bg-indigo-400",
  in_progress: "bg-blue-500",
  accepted:    "bg-indigo-400",
  completed:   "bg-emerald-500",
  cancelled:   "bg-gray-300",
}

const STATUS_LABEL: Record<string, string> = {
  pending:     "대기중",
  matched:     "매칭됨",
  in_progress: "운송중",
  accepted:    "수락됨",
  completed:   "완료",
  cancelled:   "취소됨",
}

function formatKRW(n: number) {
  return n.toLocaleString("ko-KR") + "원"
}

export function CalendarView({ events, role }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const accentColor = role === "shipper" ? "orange" : "indigo"
  const activeClass = role === "shipper"
    ? "bg-orange-500 text-white"
    : "bg-indigo-600 text-white"

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const ev of events) {
      const d = ev.date ? ev.date.slice(0, 10) : null
      if (!d) continue
      if (!map[d]) map[d] = []
      map[d].push(ev)
    }
    return map
  }, [events])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  function dateKey(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  }

  const selectedEvents = selectedDay ? (eventsByDate[selectedDay] || []) : []

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <button onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            ‹
          </button>
          <span className="font-bold text-gray-900">{year}년 {month + 1}월</span>
          <button onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            ›
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-50">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className={`py-2 text-center text-xs font-semibold ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
            }`}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="py-3" />
            }
            const key = dateKey(day)
            const dayEvents = eventsByDate[key] || []
            const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
            const isSelected = selectedDay === key
            const colIdx = idx % 7

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(isSelected ? null : key)}
                className={`py-2 flex flex-col items-center gap-0.5 rounded-lg mx-0.5 my-0.5 transition-colors ${
                  isSelected ? activeClass : isToday ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <span className={`text-sm font-medium ${
                  isSelected ? "text-white" :
                  isToday ? (accentColor === "orange" ? "text-orange-600" : "text-indigo-600") :
                  colIdx === 0 ? "text-red-400" :
                  colIdx === 6 ? "text-blue-400" :
                  "text-gray-700"
                }`}>{day}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5">
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white/80" : (STATUS_COLOR[ev.status] || "bg-gray-300")
                      }`} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">
              {new Date(selectedDay + "T00:00:00").toLocaleDateString("ko-KR", {
                month: "long", day: "numeric", weekday: "short"
              })}
              <span className="ml-2 text-gray-400 font-normal">{selectedEvents.length}건</span>
            </h3>
          </div>
          {selectedEvents.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">일정이 없습니다</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedEvents.map(ev => (
                <Link key={ev.id} href={ev.href}
                  className="flex items-start justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${STATUS_COLOR[ev.status] || "bg-gray-300"}`} />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{ev.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {STATUS_LABEL[ev.status] || ev.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-700 shrink-0">{formatKRW(ev.price)}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Monthly summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "전체", count: events.length },
          {
            label: "이번 달",
            count: Object.entries(eventsByDate)
              .filter(([d]) => d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
              .reduce((s, [, evs]) => s + evs.length, 0),
          },
          {
            label: "완료",
            count: events.filter(e => e.status === "completed").length,
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-center">
            <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
            <div className="text-xl font-bold text-gray-900">{stat.count}건</div>
          </div>
        ))}
      </div>
    </div>
  )
}
