import { createClient } from "@/lib/supabase/server"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { chargeWallet, usePoints } from "@/app/actions/wallet"
import Link from "next/link"
import { LedgerView } from "@/components/shared/LedgerView"

const TX_TYPE_LABEL: Record<string, string> = {
  deposit: "충전",
  withdrawal: "출금",
  escrow_hold: "에스크로 보관",
  escrow_release: "에스크로 해제",
  escrow_refund: "환불",
  point_earn: "포인트 적립",
  point_use: "포인트 사용",
  payout: "정산",
}
const TX_TYPE_COLOR: Record<string, string> = {
  deposit: "text-indigo-600",
  escrow_release: "text-emerald-600",
  escrow_refund: "text-emerald-600",
  point_use: "text-indigo-600",
  withdrawal: "text-red-500",
  escrow_hold: "text-amber-600",
  point_earn: "text-gray-400",
  payout: "text-emerald-600",
}

export default async function ShipperWalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: wallet },
    { data: transactions },
    { data: escrows },
  ] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", user!.id).maybeSingle(),
    supabase.from("wallet_transactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(30),
    supabase.from("escrow").select("*, orders(origin, destination, price)").order("held_at", { ascending: false }).limit(10),
  ])

  const balance = wallet?.balance || 0
  const points = wallet?.points || 0
  const heldAmount = escrows?.filter(e => e.status === "held").reduce((s, e) => s + (e.total_amount || 0), 0) || 0

  const depositTx = transactions?.filter(t => ["deposit", "escrow_release", "escrow_refund", "point_use"].includes(t.type)) || []
  const withdrawTx = transactions?.filter(t => ["withdrawal", "escrow_hold"].includes(t.type)) || []
  const pointTx = transactions?.filter(t => ["point_earn", "point_use"].includes(t.type)) || []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">지갑</h1>
          <p className="text-base text-gray-400 mt-2">충전, 에스크로, 거래 내역 관리</p>
        </div>
        <span className="text-xs text-orange-700 font-semibold bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full mt-1">화주</span>
      </div>

      {/* 잔액 카드 */}
      <div className="bg-gray-950 rounded-2xl p-6 text-white">
        <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest">사용 가능 잔액</div>
        <div className="text-4xl font-bold mb-4">{formatKRW(balance)}</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-gray-400 text-xs mb-1">에스크로 보관 중</div>
            <div className="font-bold text-amber-400">{formatKRW(heldAmount)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-gray-400 text-xs mb-1">포인트</div>
            <div className="font-bold text-indigo-400">{points.toLocaleString()}P</div>
          </div>
        </div>
      </div>

      {/* 충전 / 포인트 사용 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 충전 */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">충전</h2>
          <form action={async (fd) => { "use server"; await chargeWallet(fd) }} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[10000, 30000, 50000, 100000].map(amt => (
                <button key={amt} type="submit" name="amount" value={amt}
                  className="py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all">
                  {(amt / 10000).toLocaleString()}만원
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                name="amount"
                placeholder="직접 입력"
                min={1000}
                step={1000}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                충전
              </button>
            </div>
            <p className="text-xs text-gray-400">충전 시 1% 포인트 적립</p>
          </form>
        </div>

        {/* 포인트 사용 */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-bold text-gray-900 mb-1">포인트 사용</h2>
          <p className="text-xs text-gray-400 mb-4">1P = 1원, 100P 이상 사용 가능</p>
          <form action={async (fd) => { "use server"; await usePoints(fd) }} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">보유 포인트</span>
                <span className="text-sm font-bold text-indigo-600">{points.toLocaleString()}P</span>
              </div>
              <input
                type="number"
                name="points"
                placeholder="사용할 포인트"
                min={100}
                max={points}
                step={100}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button type="submit" disabled={points < 100}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              포인트 → 잔액 전환
            </button>
          </form>
        </div>
      </div>

      {/* 에스크로 현황 */}
      {escrows && escrows.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">에스크로 현황</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {escrows.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium text-gray-800 truncate max-w-[220px]">
                    {e.orders?.origin} → {e.orders?.destination}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatDate(e.held_at)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{formatKRW(e.total_amount)}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    e.status === "held" ? "bg-amber-100 text-amber-700" :
                    e.status === "released" ? "bg-emerald-100 text-emerald-700" :
                    e.status === "refunded" ? "bg-indigo-100 text-indigo-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {e.status === "held" ? "보관 중" :
                     e.status === "released" ? "지급 완료" :
                     e.status === "refunded" ? "환불됨" : "분쟁"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 거래 내역 탭 */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">거래 내역</h2>
          <span className="text-xs text-gray-400">{transactions?.length || 0}건</span>
        </div>

        {!transactions || transactions.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">거래 내역이 없습니다</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{tx.description}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {TX_TYPE_LABEL[tx.type] || tx.type} · {formatDate(tx.created_at)}
                  </div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  {tx.amount !== 0 && (
                    <div className={`text-sm font-bold ${tx.amount > 0 ? "text-indigo-600" : "text-red-500"}`}>
                      {tx.amount > 0 ? "+" : ""}{formatKRW(tx.amount)}
                    </div>
                  )}
                  {tx.points_change !== 0 && (
                    <div className={`text-xs font-semibold ${tx.points_change > 0 ? "text-indigo-500" : "text-gray-400"}`}>
                      {tx.points_change > 0 ? "+" : ""}{tx.points_change}P
                    </div>
                  )}
                  <div className="text-[10px] text-gray-300 mt-0.5">잔액 {formatKRW(tx.balance_after)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 포인트 내역 */}
      {pointTx.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">포인트 내역</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {pointTx.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700 truncate">{tx.description}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatDate(tx.created_at)}</div>
                </div>
                <div className={`text-sm font-bold ${tx.points_change > 0 ? "text-indigo-600" : "text-gray-500"}`}>
                  {tx.points_change > 0 ? "+" : ""}{tx.points_change}P
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 가계부 */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900 text-sm">가계부</h2>
          <p className="text-xs text-gray-400 mt-0.5">수입/지출 일·주·월 단위 조회</p>
        </div>
        <div className="p-4">
          <LedgerView transactions={transactions || []} role="shipper" />
        </div>
      </div>
    </div>
  )
}
