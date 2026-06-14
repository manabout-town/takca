import { createClient } from "@/lib/supabase/server"
import { OrderCard } from "@/components/shared/OrderCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { FeedFilter } from "@/components/driver/FeedFilter"
import { CARGO_TYPES } from "@/lib/types"

interface SearchParams { cargoType?: string; origin?: string; minPrice?: string; maxPrice?: string }

export default async function DriverFeedPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  let query = supabase
    .from("orders")
    .select("*")
    .eq("status", "pending")
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50)

  if (searchParams.cargoType) query = query.eq("cargo_type", searchParams.cargoType)
  if (searchParams.origin) query = query.ilike("origin", `%${searchParams.origin}%`)
  if (searchParams.minPrice) query = query.gte("price", parseInt(searchParams.minPrice))
  if (searchParams.maxPrice) query = query.lte("price", parseInt(searchParams.maxPrice))

  const { data: orders } = await query

  const urgentCount = orders?.filter(o => o.is_urgent).length || 0

  return (
    <div>
      <PageHeader
        title="의뢰 피드"
        description={`${orders?.length || 0}건 | 긴급 ${urgentCount}건`}
      />

      <FeedFilter cargoTypes={[...CARGO_TYPES]} />

      {!orders || orders.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="조건에 맞는 의뢰가 없습니다"
          description="필터를 조정하거나 나중에 다시 확인해보세요"
        />
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              href={`/driver/orders/${order.id}`}
              showStatus={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
