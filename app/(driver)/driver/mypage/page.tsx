import { createClient } from "@/lib/supabase/server"
import { DriverMypageClient } from "./DriverMypageClient"

export default async function DriverMyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: dp }, { data: matches }, { data: reviews }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user!.id).single(),
    supabase.from("driver_profiles").select("*").eq("user_id", user!.id).single(),
    supabase.from("matches").select("*, orders(price)").eq("driver_id", user!.id),
    supabase.from("reviews").select("*").eq("reviewee_id", user!.id).order("created_at", { ascending: false }),
  ])

  const completedMatches = matches?.filter(m => m.status === "completed") || []
  const totalEarned = completedMatches.reduce((s: number, m: any) =>
    s + Math.floor((m.orders?.price || 0) * 0.96), 0)

  return (
    <DriverMypageClient
      profile={profile}
      dp={dp}
      matches={matches || []}
      completedMatches={completedMatches}
      reviews={reviews || []}
      totalEarned={totalEarned}
      userId={user!.id}
    />
  )
}
