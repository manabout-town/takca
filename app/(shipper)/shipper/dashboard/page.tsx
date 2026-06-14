import { createClient } from "@/lib/supabase/server"
import { OrderCard } from "@/components/shared/OrderCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import Link from "next/link"

export default async function ShipperDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("shipper_id", user!.id)
    .order("created_at", { ascending: false })

  const active = orders?.filter(o => !["completed","cancelled"].includes(o.status)) || []
  const done = orders?.filter(o => ["completed","cancelled"].includes(o.status)) || []

  return (
    <div>
      <PageHeader
        title="내 의뢰 관리"
        description={`총 ${orders?.length || 0}건`}
        action={
          <Link href="/shipper/orders/new"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
            + 의뢰 등록
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "전체", value: orders?.length || 0, color: "text-gray-900" },
          { label: "대기 중", value: orders?.filter(o=>o.status==="pending").length || 0, color: "text-yellow-600" },
          { label: "진행 중", value: orders?.filter(o=>["matched","in_progress"].includes(o.status)).length || 0, color: "text-blue-600" },
          { label: "완료", value: orders?.filter(o=>o.status==="completed").length || 0, color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active orders */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4">진행 중인 의뢰</h2>
        {active.length === 0 ? (
          <EmptyState
            icon="📋"
            title="진행 중인 의뢰가 없습니다"
            description="새 의뢰를 등록하면 기사님들이 빠르게 수락합니다"
            action={
              <Link href="/shipper/orders/new" className="btn-primary px-6 py-2.5 rounded-lg text-sm inline-block">
                첫 의뢰 등록하기
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4">
            {active.map(order => (
              <OrderCard key={order.id} order={order} href={`/shipper/orders/${order.id}`} />
            ))}
          </div>
        )}
      </section>

      {/* Past orders */}
      {done.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4 text-gray-600">완료된 의뢰</h2>
          <div className="grid gap-3">
            {done.map(order => (
              <OrderCard key={order.id} order={order} href={`/shipper/orders/${order.id}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
