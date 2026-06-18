"use client"
import { useState, useMemo } from "react"

interface Transaction {
  id: string
  type: string
  amount: number
  balance_after: number
  description: string
  created_at: string
  points_change?: number
}

interface Props {
  transactions: Transaction[]
  role: "shipper" | "driver"
}

type Period = "day" | "week" | "month"

function formatKRW(n: number) {
  return n.toLocaleString("ko-KR") + "원"
}

function getWeekLabel(dateStr: string) {
  const d = new Date(dateStr)
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${Math.ceil(d.getDate() / 7)}주`
}

function getGroupKey(dateStr: string, period: Period) {
  const d = new Date(dateStr)
  if (period === "day") {
    return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
  }
  if (period === "week") {
    return getWeekLabel(dateStr)
  }
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })
}

function getSortKey(dateStr: string, period: Period) {
  const d = new Date(dateStr)
  if (period === "day") return dateStr.slice(0, 10)
  if (period === "week") {
    const jan1 = new Date(d.getFullYear(), 0, 1)
    const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`
  }
  return dateStr.slice(0, 7)
}

const TX_TYPE_LABEL: Record<string, string> = {
  deposit:        "충전",
  withdrawal:     "출금",
  escrow_hold:    "에스크로 보관",
  escrow_release: "에스크로 해제",
  escrow_refund:  "환불",
  point_earn:     "포인트 적립",
  point_use:      "포인트 사용",
  payout:         "정산",
  earning:        "수익",
}

export function LedgerView({ transactions, role }: Props) {
  const [period, setPeriod] = useState<Period>("month")
  const accentClass = role === "shipper" ? "border-orange-400 text-orange-600 bg-orange-50" : "border-indigo-400 text-indigo-600 bg-indigo-50"
  const activeBtnClass = role === "shipper" ? "bg-orange-500 text-white" : "bg-indigo-600 text-white"

  const groups = useMemo(() => {
    const map: Record<string, { label: string; sortKey: string; income: number; expense: number; items: Transaction[] }> = {}

    for (const tx of transactions) {
      if (!tx.created_at) continue
      const key = getSortKey(tx.created_at, period)
      const label = getGroupKey(tx.created_at, period)
      if (!map[key]) map[key] = { label, sortKey: key, income: 0, expense: 0, items: [] }
      if (tx.amount > 0) map[key].income += tx.amount
      else if (tx.amount < 0) map[key].expense += Math.abs(tx.amount)
      map[key].items.push(tx)
    }

    return Object.values(map).sort((a, b) => b.sortKey.localeCompare(a.sortKey))
  }, [transactions, period])

  const [expanded, setExpanded] = useState<string | null>(null)

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-gray-400 mb-1">총 수입</div>
          <div className="text-sm font-bold text-emerald-600">+{formatKRW(totalIncome)}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-gray-400 mb-1">총 지출</div>
          <div className="text-sm font-bold text-red-500">-{formatKRW(totalExpense)}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-gray-400 mb-1">순수익</div>
          <div className={`text-sm font-bold ${totalIncome - totalExpense >= 0 ? "text-gray-900" : "text-red-500"}`}>
            {totalIncome - totalExpense >= 0 ? "+" : ""}{formatKRW(totalIncome - totalExpense)}
          </div>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {([["day","일별"],["week","주별"],["month","월별"]] as [Period, string][]).map(([id, label]) => (
          <button key={id} onClick={() => { setPeriod(id); setExpanded(null) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              period === id ? activeBtnClass + " shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl py-12 text-center text-sm text-gray-400">
          거래 내역이 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(group => {
            const net = group.income - group.expense
            const isOpen = expanded === group.sortKey

            return (
              <div key={group.sortKey} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : group.sortKey)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{group.label}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {group.income > 0 && (
                        <span className="text-xs text-emerald-600">+{formatKRW(group.income)}</span>
                      )}
                      {group.expense > 0 && (
                        <span className="text-xs text-red-500">-{formatKRW(group.expense)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${net >= 0 ? "text-gray-900" : "text-red-500"}`}>
                      {net >= 0 ? "+" : ""}{formatKRW(net)}
                    </span>
                    <span className="text-gray-300 text-sm">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-50 divide-y divide-gray-50">
                    {group.items.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-700 truncate">{tx.description}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {TX_TYPE_LABEL[tx.type] || tx.type} · {new Date(tx.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          {tx.amount !== 0 && (
                            <div className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-600" : "text-red-500"}`}>
                              {tx.amount > 0 ? "+" : ""}{formatKRW(tx.amount)}
                            </div>
                          )}
                          {(tx.points_change ?? 0) !== 0 && (
                            <div className={`text-xs ${(tx.points_change ?? 0) > 0 ? "text-indigo-500" : "text-gray-400"}`}>
                              {(tx.points_change ?? 0) > 0 ? "+" : ""}{tx.points_change}P
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
