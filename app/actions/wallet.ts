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
  const wallet = await getOrCreateWallet(user.id)
  if (!wallet || wallet.balance < amount) return { error: "잔액이 부족합니다" }

  const newBalance = wallet.balance - amount

  await service.from("wallets").update({
    balance: newBalance,
    updated_at: new Date().toISOString(),
  }).eq("user_id", user.id)

  await service.from("wallet_transactions").insert({
    user_id: user.id,
    type: "withdrawal",
    amount: -amount,
    balance_after: newBalance,
    description: `출금 신청 — ${bankName} ${accountNumber} (${accountHolder})`,
    status: "pending",
  })

  await service.from("withdrawal_requests").insert({
    user_id: user.id,
    amount,
    bank_name: bankName,
    account_number: accountNumber,
    account_holder: accountHolder,
    status: "pending",
  })

  revalidatePath("/driver/wallet")
  revalidatePath("/shipper/wallet")
  return { success: true }
}

export async function chargeWallet(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  const amount = parseInt(formData.get("amount") as string)
  if (!amount || amount < 1000) return { error: "최소 충전 금액은 1,000원입니다" }

  // 실제 서비스에서는 여기서 Toss 결제를 시작해야 함
  // 데모용: 즉시 충전 처리
  const service = createServiceClient()
  const wallet = await getOrCreateWallet(user.id)
  const currentBalance = wallet?.balance || 0
  const newBalance = currentBalance + amount

  // 포인트: 충전액의 1% 적립
  const pointsEarned = Math.floor(amount * 0.01)
  const currentPoints = wallet?.points || 0
  const newPoints = currentPoints + pointsEarned

  await service.from("wallets").update({
    balance: newBalance,
    points: newPoints,
    updated_at: new Date().toISOString(),
  }).eq("user_id", user.id)

  await service.from("wallet_transactions").insert([
    {
      user_id: user.id,
      type: "deposit",
      amount,
      balance_after: newBalance,
      description: `지갑 충전`,
      status: "completed",
    },
    ...(pointsEarned > 0 ? [{
      user_id: user.id,
      type: "point_earn",
      amount: 0,
      balance_after: newBalance,
      points_change: pointsEarned,
      points_after: newPoints,
      description: `충전 포인트 적립 (${amount.toLocaleString()}원의 1%)`,
      status: "completed",
    }] : []),
  ])

  revalidatePath("/shipper/wallet")
  return { success: true, pointsEarned }
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
