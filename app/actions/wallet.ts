"use server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

async function getOrCreateWallet(userId: string) {
  const service = createServiceClient()
  const { data } = await service
    .from("wallets")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true })
    .select()
    .single()

  const { data: wallet } = await service
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single()

  return wallet
}

export async function requestWithdrawal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  const amount = parseInt(formData.get("amount") as string)
  const bankName = formData.get("bankName") as string
  const accountNumber = formData.get("accountNumber") as string
  const accountHolder = formData.get("accountHolder") as string

  if (!amount || amount < 10000) return { error: "최소 출금액은 10,000원입니다" }
  if (!bankName || !accountNumber || !accountHolder) return { error: "계좌 정보를 입력해주세요" }

  const service = createServiceClient()
  const { data, error } = await service.rpc("request_withdrawal_atomic", {
    p_user_id: user.id,
    p_amount: amount,
    p_bank_name: bankName,
    p_account_number: accountNumber,
    p_account_holder: accountHolder,
  })

  if (error) return { error: error.message }
  if (data?.error === "insufficient_balance") return { error: "잔액이 부족합니다" }

  revalidatePath("/driver/wallet")
  revalidatePath("/shipper/wallet")
  return { success: true }
}

export async function chargeWallet(formData: FormData) {
  // Toss 결제 연동 전까지 비활성화 — 직접 잔액 조작 차단
  return { error: "결제 연동 준비 중입니다. Toss 결제 연동 후 이용 가능합니다." }
}

export async function usePoints(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  const points = parseInt(formData.get("points") as string)
  if (!points || points < 100) return { error: "최소 100 포인트부터 사용 가능합니다" }

  const service = createServiceClient()
  const wallet = await getOrCreateWallet(user.id)
  if (!wallet || wallet.points < points) return { error: "포인트가 부족합니다" }

  const pointWon = points // 1포인트 = 1원
  const newBalance = (wallet.balance || 0) + pointWon
  const newPoints = wallet.points - points

  await service.from("wallets").update({
    balance: newBalance,
    points: newPoints,
    updated_at: new Date().toISOString(),
  }).eq("user_id", user.id)

  await service.from("wallet_transactions").insert({
    user_id: user.id,
    type: "point_use",
    amount: pointWon,
    balance_after: newBalance,
    points_change: -points,
    points_after: newPoints,
    description: `포인트 ${points.toLocaleString()}P 사용 → ${pointWon.toLocaleString()}원 전환`,
    status: "completed",
  })

  revalidatePath("/shipper/wallet")
  revalidatePath("/driver/wallet")
  return { success: true }
}
