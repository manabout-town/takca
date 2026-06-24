import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ConditionReportForm } from "./ConditionReportForm"

interface PageProps {
  params: Promise<{ matchId: string }>
  searchParams: Promise<{ type?: string }>
}

export default async function ConditionReportPage({ params, searchParams }: PageProps) {
  const { matchId } = await params
  const { type } = await searchParams

  if (type !== "pickup" && type !== "delivery") {
    redirect(`/driver/matches/${matchId}/condition-report?type=pickup`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: match } = await supabase
    .from("matches")
    .select("id, driver_id, status, orders!inner(id, origin, destination, price, pickup_at)")
    .eq("id", matchId)
    .single()

  if (!match) notFound()
  if (match.driver_id !== user.id) redirect("/driver/matches")
  if (["completed", "cancelled"].includes(match.status)) {
    redirect("/driver/matches")
  }

  // Check if already submitted
  const { data: existing } = await supabase
    .from("condition_reports")
    .select("id")
    .eq("match_id", matchId)
    .eq("type", type)
    .maybeSingle()

  const order = match.orders as any

  return (
    <ConditionReportForm
      matchId={matchId}
      type={type as "pickup" | "delivery"}
      order={order}
      alreadySubmitted={!!existing}
    />
  )
}
