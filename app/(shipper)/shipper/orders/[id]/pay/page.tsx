"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatKRW } from "@/lib/utils/format"
import { calculateFee } from "@/lib/utils/format"

declare const TossPayments: any

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.from("orders").select("*, matches(id, status, driver_id)").eq("id", params.id).single()
      .then(({ data }) => { setOrder(data); setLoading(false) })
  }, [params.id])

  useEffect(() => {
    if (!document.getElementById("toss-sdk")) {
      const script = document.createElement("script")
      script.id = "toss-sdk"
      script.src = "https://js.tosspayments.com/v1/payment"
      document.head.appendChild(script)
    }
  }, [])

  async function handlePay() {
    if (!order) return
    const activeMatch = order.matches?.find((m: any) => m.status === "accepted")
    if (!activeMatch) { alert("매칭된 기사가 없습니다"); return }

    const { platformFee, driverPayout } = calculateFee(order.price)
    const toss = TossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await toss.requestPayment("카드", {
      amount: order.price,
      orderId: `escrow_${order.id}_${Date.now()}`,
      orderName: `${order.origin}→${order.destination} 운송 에스크로`,
      customerName: user?.email,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/toss/confirm`,
      failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/toss/fail`,
      useEscrow: true,
    })
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">로딩 중...</div>
  if (!order) return <div className="text-center text-red-500 py-20">주문을 찾을 수 없습니다</div>

  const { platformFee, driverPayout } = calculateFee(order.price)

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">에스크로 결제</h1>
      <div className="bg-white rounded-2xl border p-6 mb-6 space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">구간</span><span className="font-medium">{order.origin} → {order.destination}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">화물</span><span className="font-medium">{order.cargo_type}</span></div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">운임</span><span>{formatKRW(order.price)}</span></div>
          <div className="flex justify-between text-red-500"><span>플랫폼 수수료 (4%)</span><span>-{formatKRW(platformFee)}</span></div>
          <div className="flex justify-between font-bold text-base pt-1 border-t"><span>기사 지급액</span><span className="text-blue-700">{formatKRW(driverPayout)}</span></div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
          💡 결제 금액은 에스크로로 보관됩니다. 운송 완료 확인 후 기사에게 지급됩니다.
        </div>
      </div>
      <button onClick={handlePay} className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition">
        {formatKRW(order.price)} 에스크로 결제
      </button>
    </div>
  )
}
