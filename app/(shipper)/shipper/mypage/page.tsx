import { createClient } from "@/lib/supabase/server"
import { formatKRW, formatDate } from "@/lib/utils/format"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { signOut } from "@/app/actions/auth"

export default async function ShipperMyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user!.id).single(),
    supabase.from("orders").select("*").eq("shipper_id", user!.id),
  ])

  const completedOrders = orders?.filter(o => o.status === "completed") || []
  const totalSpent = completedOrders.reduce((s, o) => s + o.price, 0)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>

      <Card className="mb-4">
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              🏢
            </div>
            <div>
              <div className="font-bold text-lg">{profile?.name}</div>
              <div className="text-sm text-gray-500">{profile?.email}</div>
              <div className="text-sm text-gray-500">{profile?.phone}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "총 의뢰", value: `${orders?.length || 0}건` },
          { label: "완료", value: `${completedOrders.length}건` },
          { label: "총 지출", value: formatKRW(totalSpent) },
        ].map(s => (
          <Card key={s.label}>
            <CardBody className="text-center py-4">
              <div className="font-bold text-lg text-blue-700">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><h2 className="font-bold">최근 거래 내역</h2></CardHeader>
        <CardBody className="p-0">
          {completedOrders.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-6">완료된 거래가 없습니다</p>
          ) : (
            <div className="divide-y">
              {completedOrders.slice(0, 10).map(o => (
                <div key={o.id} className="px-6 py-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">{o.origin} → {o.destination}</div>
                    <div className="text-xs text-gray-500">{formatDate(o.created_at)}</div>
                  </div>
                  <div className="font-semibold text-blue-700">{formatKRW(o.price)}</div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <form action={signOut} className="mt-6">
        <button type="submit" className="w-full py-3 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
          로그아웃
        </button>
      </form>
    </div>
  )
}
