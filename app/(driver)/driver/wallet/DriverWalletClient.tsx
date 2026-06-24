"use client"
import { useState, useTransition } from "react"
import { requestWithdrawal, chargeWallet, usePoints } from "@/app/actions/wallet"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { LedgerView } from "@/components/shared/LedgerView"

const BANKS = ["국민은행","신한은행","우리은행","하나은행","농협은행","기업은행","카카오뱅크","토스뱅크","케이뱅크","SC제일은행","부산은행","대구은행","경남은행","광주은행","전북은행"]

type Tab = "overview" | "charge" | "withdraw" | "history" | "ledger"
type HistoryTab = "income" | "withdrawal"

interface Props {
  wallet: any
  transactions: any[]
  pendingPayouts: any[]
  payouts: any[]
  withdrawalRequests: any[]
  pendingAmount: number
  totalPaid: number
}

function Feedback({ msg, isError }: { msg: string; isError?: boolean }) {
  return (
    <p className={`text-sm px-4 py-2.5 rounded-xl ${isError ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
      {isError ? "⚠ " : "✓ "}{msg}
    </p>
  )
}

export function DriverWalletClient({ wallet, transactions, pendingPayouts, payouts, withdrawalRequests, pendingAmount, totalPaid }: Props) {
  const [tab, setTab] = useState<Tab>("overview")
  const [historyTab, setHistoryTab] = useState<HistoryTab>("income")
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ msg: string; isError: boolean } | null>(null)
  const [chargeInput, setChargeInput] = useState("")
  const [withdrawInput, setWithdrawInput] = useState("")

  const balance = wallet?.balance || 0
  const points  = wallet?.points || 0

  function showFeedback(msg: string, isError = false) {
    setFeedback({ msg, isError })
    setTimeout(() => setFeedback(null), 4000)
  }

  function handleAction(action: (fd: FormData) => Promise<any>) {
    return (formData: FormData) => {
      startTransition(async () => {
        const result = await action(formData)
        if (result?.error) showFeedback(result.error, true)
        else showFeedback(result?.success ? "처리되었습니다" : "완료")
      })
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",  label: "잔액 개요" },
    { id: "charge",    label: "충전" },
    { id: "withdraw",  label: "출금" },
    { id: "history",   label: "내역" },
    { id: "ledger",    label: "가계부" },
  ]

  const incomeTransactions   = transactions.filter(t => t.amount > 0 || t.points_change > 0)
  const withdrawalHistory    = transactions.filter(t => t.amount < 0 && t.type === "withdrawal")

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">수익 지갑</h1>
        <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-semibold border border-emerald-100">기사</span>
      </div>

      {/* 잔액 카드 (항상 표시) */}
      <div className="bg-gray-950 rounded-2xl p-6 text-white">
        <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest">출금 가능 잔액</div>
        <div className="text-4xl font-bold mb-4">{formatKRW(balance)}</div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-gray-400 text-xs mb-1">정산 예정</div>
            <div className="font-bold text-amber-400">{formatKRW(pendingAmount)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-gray-400 text-xs mb-1">누적 수령</div>
            <div className="font-bold text-emerald-400">{formatKRW(totalPaid)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-gray-400 text-xs mb-1">포인트</div>
            <div className="font-bold text-indigo-400">{points.toLocaleString()}P</div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
              tab === t.id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {feedback && <Feedback msg={feedback.msg} isError={feedback.isError} />}

      {/* ── 잔액 개요 탭 ── */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* 정산 예정 */}
          {pendingPayouts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-amber-100">
                <h2 className="font-semibold text-amber-800 text-sm">정산 예정 {pendingPayouts.length}건</h2>
              </div>
              <div className="divide-y divide-amber-100">
                {pendingPayouts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3">
                    <div className="text-sm text-amber-700 truncate max-w-[220px]">
                      {p.escrow?.orders?.origin} → {p.escrow?.orders?.destination}
                    </div>
                    <div className="text-sm font-bold text-amber-800">{formatKRW(p.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 포인트 전환 */}
          {points >= 100 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-semibold text-gray-900 mb-1 text-sm">포인트 → 잔액 전환</h2>
              <p className="text-xs text-gray-400 mb-4">보유: <strong className="text-indigo-600">{points.toLocaleString()}P</strong> · 1P = 1원 · 최소 100P</p>
              <form action={handleAction(usePoints)} className="flex gap-2">
                <input type="number" name="points" placeholder="전환할 포인트" min={100} max={points} step={100}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                <button type="submit" disabled={isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                  전환
                </button>
              </form>
            </div>
          )}

          {/* 빠른 이동 */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setTab("charge")}
              className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:border-indigo-200 transition-colors">
              <div className="text-xl mb-1">💰</div>
              <p className="font-semibold text-sm text-gray-900">충전하기</p>
              <p className="text-xs text-gray-400">플랫폼 선불 충전</p>
            </button>
            <button onClick={() => setTab("withdraw")}
              className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:border-emerald-200 transition-colors">
              <div className="text-xl mb-1">🏦</div>
              <p className="font-semibold text-sm text-gray-900">출금하기</p>
              <p className="text-xs text-gray-400">은행 계좌로 출금</p>
            </button>
          </div>
        </div>
      )}

      {/* ── 충전 탭 ── */}
      {tab === "charge" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-1 text-sm">충전</h2>
          <p className="text-xs text-gray-400 mb-4">충전 시 1% 포인트 적립 · 즉시 처리</p>
          <form action={handleAction(chargeWallet)} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[10000, 30000, 50000, 100000].map(amt => (
                <button key={amt} type="button"
                  onClick={() => setChargeInput(String(amt))}
                  className={`py-2.5 text-sm font-semibold border rounded-xl transition-all ${
                    chargeInput === String(amt)
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700"
                  }`}>
                  {(amt / 10000).toLocaleString()}만원
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                name="amount"
                type="number"
                value={chargeInput}
                onChange={e => setChargeInput(e.target.value)}
                placeholder="직접 입력"
                min={1000}
                step={1000}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
            </div>
            {chargeInput && Number(chargeInput) >= 1000 && (
              <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700 space-y-1">
                <div className="flex justify-between">
                  <span>충전 금액</span>
                  <span className="font-semibold">{formatKRW(Number(chargeInput))}</span>
                </div>
                <div className="flex justify-between text-indigo-500">
                  <span>적립 포인트 (1%)</span>
                  <span>+{Math.floor(Number(chargeInput) * 0.01).toLocaleString()}P</span>
                </div>
              </div>
            )}
            <button type="submit" disabled={isPending || !chargeInput || Number(chargeInput) < 1000}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm">
              {isPending ? "처리 중..." : "충전하기"}
            </button>
          </form>
        </div>
      )}

      {/* ── 출금 탭 ── */}
      {tab === "withdraw" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-1 text-sm">출금 신청</h2>
          <p className="text-xs text-gray-400 mb-4">영업일 1~3일 내 처리 · 최소 1만원</p>
          <form action={handleAction(requestWithdrawal)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">은행<span className="text-red-400 ml-0.5">*</span></label>
                <select name="bankName" required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">선택</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">예금주<span className="text-red-400 ml-0.5">*</span></label>
                <input name="accountHolder" type="text" placeholder="예금주명" required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">계좌번호<span className="text-red-400 ml-0.5">*</span></label>
              <input name="accountNumber" type="text" placeholder="'-' 없이 입력" required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">출금 금액<span className="text-red-400 ml-0.5">*</span></label>
              <div className="relative">
                <input name="amount" type="number" value={withdrawInput}
                  onChange={e => setWithdrawInput(e.target.value)}
                  placeholder="10,000원 이상" min={10000} step={1000} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[30000, 50000, 100000].map(amt => (
                  <button key={amt} type="button" onClick={() => setWithdrawInput(String(amt))}
                    className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                    {(amt / 10000)}만원
                  </button>
                ))}
                <button type="button" onClick={() => setWithdrawInput(String(balance))}
                  className="text-xs border border-indigo-200 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                  전액
                </button>
              </div>
            </div>
            <button type="submit" disabled={isPending || balance < 10000}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {isPending ? "신청 중..." : "출금 신청"}
            </button>
            {balance < 10000 && (
              <p className="text-xs text-red-500 text-center">잔액 부족 (최소 10,000원 필요)</p>
            )}
          </form>
        </div>
      )}

      {/* ── 내역 탭 ── */}
      {tab === "history" && (
        <div className="space-y-4">
          {/* 서브탭 */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {([["income","입금 내역"],["withdrawal","출금 신청 내역"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setHistoryTab(id)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  historyTab === id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* 입금 내역 */}
          {historyTab === "income" && (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {incomeTransactions.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">입금 내역이 없습니다</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {incomeTransactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{tx.description}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{formatDate(tx.created_at)}</div>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        {tx.amount > 0 && (
                          <div className="text-sm font-bold text-emerald-600">+{formatKRW(tx.amount)}</div>
                        )}
                        {tx.points_change > 0 && (
                          <div className="text-xs text-indigo-500">+{tx.points_change}P</div>
                        )}
                        <div className="text-[10px] text-gray-300 mt-0.5">잔액 {formatKRW(tx.balance_after)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 출금 신청 내역 */}
          {historyTab === "withdrawal" && (
            <div className="space-y-4">
              {withdrawalRequests.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl py-12 text-center text-sm text-gray-400">
                  출금 신청 내역이 없습니다
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-gray-50">
                    {withdrawalRequests.map((w: any) => (
                      <div key={w.id} className="flex items-center justify-between px-5 py-3.5">
                        <div>
                          <div className="text-sm font-medium text-gray-800">{formatKRW(w.amount)}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {w.bank_name} {w.account_number} · {formatDate(w.requested_at)}
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          w.status === "pending"    ? "bg-amber-100 text-amber-700" :
                          w.status === "processing" ? "bg-indigo-100 text-indigo-700" :
                          w.status === "completed"  ? "bg-emerald-100 text-emerald-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {w.status === "pending" ? "처리 대기" : w.status === "processing" ? "진행 중" : w.status === "completed" ? "완료" : "거절"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 전체 거래 내역 (출금 포함) */}
              {withdrawalHistory.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900">출금 거래 내역</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {withdrawalHistory.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                        <div>
                          <div className="text-sm font-medium text-gray-800">{tx.description}</div>
                          <div className="text-xs text-gray-400">{formatDate(tx.created_at)}</div>
                        </div>
                        <div className="text-sm font-bold text-red-500">{formatKRW(tx.amount)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* ── 가계부 탭 ── */}
      {tab === "ledger" && (
        <LedgerView transactions={transactions} role="driver" />
      )}
    </div>
  )
}
