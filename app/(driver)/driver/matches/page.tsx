import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { MATCH_STATUS_LABEL } from "@/lib/utils/status"
import Link from "next/link"

export default async function DriverMatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from("matches")
    .select("*, orders(*, shippers:users!shipper_id(name, phone))")
    .eq("driver_id", user!.id)
    .order("matched_at", { ascending: false })

  return (
    <div>
      <PageHeader title="내 운송" description={`총 ${matches?.length || 0}건`} />

      {!matches || matches.length === 0 ? (
        <EmptyState
          icon="🚛"
          title="수락한 의뢰가 없습니다"
          description="피드에서 의뢰를 수락하면 여기 표시됩니다"
          action={
            <Link href="/driver/feed" className="btn-primary px-6 py-2.5 rounded-lg text-sm inline-block">
              의뢰 피드 보기
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {matches.map((match: any) => (
            <Link key={match.id} href={`/chat/${match.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className={`badge ${
                  match.status === "completed" ? "bg-green-100 text-green-700" :
                  match.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {MATCH_STATUS_LABEL[match.status as keyof typeof MATCH_STATUS_LABEL]}
                </span>
                <span className="font-bold text-blue-700">{formatKRW(match.orders?.price)}</span>
              </div>
              <div className="text-sm font-medium mb-1">
                {match.orders?.origin} → {match.orders?.destination}
              </div>
              <div className="text-xs text-gray-500">
                화주: {match.orders?.shippers?.name} | {formatDate(match.matched_at)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
