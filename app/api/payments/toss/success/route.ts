import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { calculateFee } from "@/lib/utils/format"

// Toss Payments redirects here as GET after payment authorization
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const paymentKey = searchParams.get("paymentKey")
  const orderId = searchParams.get("orderId")
  const amount = searchParams.get("amount")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hwamulro.vercel.app"

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(
      new URL(`${appUrl}/payment/fail?message=${encodeURIComponent("결제 정보가 올바르지 않습니다")}`)
    )
  }

  try {
    // Call Toss confirm API
    const encoded = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64")
    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount: parseInt(amount) }),
    })

    if (!tossRes.ok) {
      const err = await tossRes.json()
      return NextResponse.redirect(
        new URL(`${appUrl}/payment/fail?message=${encodeURIComponent(err.message || "결제 승인 실패")}`)
      )
    }

    const service = createServiceClient()
    // orderId format: "escrow_{dbOrderId}_{timestamp}"
    const parts = orderId.split("_")
    const dbOrderId = parts[1]

    if (!dbOrderId) {
      return NextResponse.redirect(
        new URL(`${appUrl}/payment/fail?message=${encodeURIComponent("주문 정보 오류")}`)
      )
    }

    const { data: order } = await service
      .from("orders")
      .select("*, matches(id, driver_id, status)")
      .eq("id", dbOrderId)
      .single()

    if (!order) {
      return NextResponse.redirect(
        new URL(`${appUrl}/payment/fail?message=${encodeURIComponent("주문을 찾을 수 없습니다")}`)
      )
    }

    const activeMatch = (order.matches as any[])?.find((m: any) => m.status === "accepted")
    if (!activeMatch) {
      return NextResponse.redirect(
        new URL(`${appUrl}/payment/fail?message=${encodeURIComponent("매칭된 기사가 없습니다")}`)
      )
    }

    const totalAmount = parseInt(amount)
    const { platformFee, driverPayout } = calculateFee(totalAmount)

    // Idempotent - skip if escrow already created
    const { data: existingEscrow } = await service
      .from("escrow")
      .select("id")
      .eq("match_id", activeMatch.id)
      .maybeSingle()

    if (!existingEscrow) {
      await service.from("escrow").insert({
        order_id: dbOrderId,
        match_id: activeMatch.id,
        total_amount: totalAmount,
        platform_fee: platformFee,
        driver_payout: driverPayout,
        status: "held",
        pg_transaction_id: paymentKey,
        held_at: new Date().toISOString(),
      })
      await service.from("orders").update({ status: "in_progress" }).eq("id", dbOrderId)
      await service.from("matches").update({ status: "in_progress" }).eq("id", activeMatch.id)
    }

    return NextResponse.redirect(new URL(`${appUrl}/shipper/orders/${dbOrderId}`))
  } catch (e: any) {
    return NextResponse.redirect(
      new URL(`${appUrl}/payment/fail?message=${encodeURIComponent(e.message || "오류가 발생했습니다")}`)
    )
  }
}
