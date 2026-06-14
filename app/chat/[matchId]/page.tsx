import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ChatWindow } from "@/components/chat/ChatWindow"
import type { User, Match, Order } from "@/lib/types"

export default async function ChatPage({ params }: { params: { matchId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: match } = await supabase
    .from("matches")
    .select(`
      *,
      orders(*, shippers:users!shipper_id(*)),
      drivers:users!driver_id(*)
    `)
    .eq("id", params.matchId)
    .single()

  if (!match) notFound()

  // Only shipper or driver of this match can access
  const isShipper = match.orders?.shipper_id === user.id
  const isDriver = match.driver_id === user.id
  if (!isShipper && !isDriver) redirect("/")

  const { data: currentUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: initialMessages } = await supabase
    .from("chats")
    .select("*, sender:users!sender_id(id, name, role)")
    .eq("match_id", params.matchId)
    .order("sent_at", { ascending: true })
    .limit(100)

  return (
    <ChatWindow
      match={match as any}
      currentUser={currentUser as User}
      initialMessages={initialMessages || []}
      isShipper={isShipper}
    />
  )
}
