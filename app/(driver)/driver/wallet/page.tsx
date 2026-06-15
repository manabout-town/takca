import { createClient } from "@/lib/supabase/server"
import { DriverWalletClient } from "./DriverWalletClient"

export default async function DriverWalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: wallet },
    { data: transactions },
    { data: pendingPayouts },
    { data: payouts },
    { data: withdrawalRequests },
  ] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", user!.id).maybeSingle(),
    supabase.from("wallet_transactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("payouts").select("*, escrow(total_amount, orders(origin, destination))").eq("driver_id", user!.id).eq("status", "pending"),
    supabase.from("payouts").select("*, escrow(total_amount, orders(origin, destination))").eq("driver_id", user!.id).eq("status", "paid").order("paid_at", { ascending: false }).limit(10),
    supabase.from("withdrawal_requests").select("*").eq("user_id", user!.id).order("requested_at", { ascending: false }).limit(20),
  ])

  const pendingAmount = pendingPayouts?.reduce((s, p) => s + (p.amount || 0), 0) || 0
  const totalPaid     = payouts?.reduce((s, p) => s + (p.amount || 0), 0) || 0

  return (
    <DriverWalletClient
      wallet={wallet}
      transactions={transactions || []}
      pendingPayouts={pendingPayouts || []}
      payouts={payouts || []}
      withdrawalRequests={withdrawalRequests || []}
      pendingAmount={pendingAmount}
      totalPaid={totalPaid}
    />
  )
}
