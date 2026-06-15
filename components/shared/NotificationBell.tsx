"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Notification } from "@/lib/types"

interface Props {
  userId: string
}

export function NotificationBell({ userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setNotifications(data)
      })

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function markRead(n: Notification) {
    setOpen(false)
    if (!n.is_read) {
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id)
    }
    if (n.link) router.push(n.link)
  }

  async function markAllRead() {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (!unreadIds.length) return
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds)
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return "방금"
    if (m < 60) return `${m}분 전`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}시간 전`
    return `${Math.floor(h / 24)}일 전`
  }

  const typeIcon: Record<string, string> = {
    match_request: "🤝",
    order_status: "📦",
    chat: "💬",
    escrow: "💳",
    dispute: "⚠️",
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="알림"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-sm text-gray-900">알림</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                전체 읽음
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">알림이 없습니다</div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.is_read ? "bg-blue-50/40" : ""}`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{typeIcon[n.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 leading-tight">{n.title}</p>
                      {!n.is_read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
