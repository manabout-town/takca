import { createClient } from "@/lib/supabase/server"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { approveWithdrawal, rejectWithdrawal } from "@/app/actions/admin"

export default async function AdminWithdrawalsPage() {
  const supabase = await createClient()

  const { data: requests } = await supabase
    .from("withdrawal_requests")
    .select("*, users(name, phone)")
    .order("requested_at", { ascending: false })
    .limit(100)

  const pending = requests?.filter(r => r.status === "pending") || []
  const processed = requests?.filter(r => r.status !== "pending") || []

  const statusLabel: Record<string, string> = {
    pending: "대기 중",
    processing: "처리 중",
    completed: "완료",
    rejected: "거절",
  }
  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-600",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">출금 관리</h1>
        <p className="text-sm text-gray-400 mt-1">대기 중 {pending.length}건</p>
      </div>

      {/* Pending */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">승인 대기</h2>
        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            처리할 출금 요청이 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((req: any) => (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{req.users?.name}</p>
                    <p className="text-xs text-gray-400">{req.users?.phone} · {formatDate(req.requested_at)}</p>
                  </div>
                  <p className="text-base md:text-lg font-bold text-gray-900 shrink-0 ml-3">{formatKRW(req.amount)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-3 md:px-4 py-3 text-sm text-gray-700 mb-4 flex flex-wrap gap-x-3 gap-y-1">
                  <span><span className="text-gray-400">은행</span> {req.bank_name}</span>
                  <span><span className="text-gray-400">계좌</span> {req.account_number}</span>
                  <span><span className="text-gray-400">예금주</span> {req.account_holder}</span>
                </div>
                <div className="flex gap-2">
                  <form action={async () => { "use server"; await approveWithdrawal(req.id) }} className="flex-1">
                    <button type="submit" className="w-full py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors">
                      ✓ 지급 완료
                    </button>
                  </form>
                  <form action={async () => { "use server"; await rejectWithdrawal(req.id, "관리자 거절") }}>
                    <button type="submit" className="px-5 py-3 min-h-[44px] border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors">
                      거절
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Processed history */}
      {processed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">처리 완료</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {processed.map((req: any, i: number) => (
              <div key={req.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 md:px-5 py-4 ${i > 0 ? "border-t border-gray-50" : ""}`}>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{req.users?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{req.bank_name} {req.account_number} · {formatDate(req.processed_at || req.requested_at)}</p>
                  {req.rejected_reason && (
                    <p className="text-xs text-red-500 mt-0.5">사유: {req.rejected_reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatKRW(req.amount)}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[req.status] || "bg-gray-100 text-gray-600"}`}>
                    {statusLabel[req.status] || req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
