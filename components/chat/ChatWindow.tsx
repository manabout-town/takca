"use client"
import { useState, useEffect, useRef, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { formatKRW } from "@/lib/utils/format"
import { requestCompletion, confirmCompletion, confirmStart } from "@/app/actions/orders"
import type { User } from "@/lib/types"

interface Message {
  id: string
  match_id: string
  sender_id: string
  message: string
  sent_at: string
  sender?: { id: string; name: string; role: string }
}

interface ChatWindowProps {
  match: any
  currentUser: User
  initialMessages: Message[]
  isShipper: boolean
}

export function ChatWindow({ match, currentUser, initialMessages, isShipper }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const order = match.orders
  const otherUser = isShipper ? match.drivers : order?.shippers

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${match.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `match_id=eq.${match.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message
          // Fetch sender info
          const { data: sender } = await supabase
            .from("users")
            .select("id, name, role")
            .eq("id", newMsg.sender_id)
            .single()
          setMessages(prev => [...prev, { ...newMsg, sender: sender || undefined }])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [match.id, supabase])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)

    const text = input.trim()
    setInput("")

    await supabase.from("chats").insert({
      match_id: match.id,
      sender_id: currentUser.id,
      message: text,
      sent_at: new Date().toISOString(),
    })

    setSending(false)
  }

  const completionRequested = messages.some(m => m.message === "SYSTEM:COMPLETION_REQUESTED")
  const statusLabel = match.status === "accepted" ? "매칭 완료" :
    match.status === "in_progress" ? "운송 중" :
    match.status === "completed" ? "완료" : match.status

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href={isShipper ? `/shipper/orders/${order?.id}` : "/driver/matches"}
          className="text-gray-500 hover:text-gray-700">
          ←
        </Link>
        <div className="flex-1">
          <div className="font-semibold text-sm">{otherUser?.name}</div>
          <div className="text-xs text-gray-500">
            {order?.origin} → {order?.destination} | {formatKRW(order?.price)}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          match.status === "completed" ? "bg-green-100 text-green-700" :
          match.status === "in_progress" ? "bg-blue-100 text-blue-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {statusLabel}
        </span>
      </div>

      {/* Action banner */}
      {match.status === "accepted" && !isShipper && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-blue-700">운송을 시작하셨나요?</span>
          <form action={confirmStart.bind(null, match.id)}>
            <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold">
              운송 시작
            </button>
          </form>
        </div>
      )}
      {match.status === "in_progress" && !isShipper && !completionRequested && (
        <div className="bg-green-50 border-b border-green-100 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-green-700">운송을 완료하셨나요?</span>
          <form action={requestCompletion.bind(null, match.id)}>
            <button type="submit" className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold">
              완료 요청
            </button>
          </form>
        </div>
      )}
      {completionRequested && isShipper && match.status !== "completed" && (
        <div className="bg-orange-50 border-b border-orange-100 px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-orange-700">기사님이 완료를 요청했습니다</div>
            <div className="text-xs text-orange-600 mt-0.5">확인 시 에스크로가 해제됩니다</div>
          </div>
          <form action={confirmCompletion.bind(null, match.id)}>
            <button type="submit" className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
              완료 확인
            </button>
          </form>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            매칭이 확정되었습니다! 먼저 인사를 건네보세요 👋
          </div>
        )}
        {messages.map((msg) => {
          if (msg.message === "SYSTEM:COMPLETION_REQUESTED") {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                  기사님이 운송 완료를 요청했습니다
                </span>
              </div>
            )
          }
          const isMe = msg.sender_id === currentUser.id
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold mr-2 shrink-0 mt-1">
                  {msg.sender?.name?.[0] || "?"}
                </div>
              )}
              <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {!isMe && (
                  <span className="text-xs text-gray-500 ml-1">{msg.sender?.name}</span>
                )}
                <div className={`px-3 py-2 rounded-2xl text-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                }`}>
                  {msg.message}
                </div>
                <span className="text-xs text-gray-400 px-1">
                  {new Date(msg.sent_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        {match.status === "completed" ? (
          <div className="text-center text-sm text-gray-500 py-2">거래가 완료되었습니다</div>
        ) : (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition"
            >
              전송
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
