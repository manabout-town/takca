import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import { PageHeader } from "@/components/shared/PageHeader"

async function verifyDriver(driverProfileId: string) {
  "use server"
  const service = createServiceClient()
  await service.from("driver_profiles").update({ is_verified: true }).eq("id", driverProfileId)
  revalidatePath("/admin/drivers")
}

async function unverifyDriver(driverProfileId: string) {
  "use server"
  const service = createServiceClient()
  await service.from("driver_profiles").update({ is_verified: false }).eq("id", driverProfileId)
  revalidatePath("/admin/drivers")
}

export default async function AdminDriversPage() {
  const supabase = await createClient()

  const { data: drivers } = await supabase
    .from("driver_profiles")
    .select("*, users(id, name, email, phone, status, created_at)")
    .order("is_verified", { ascending: true })

  const verified = drivers?.filter(d => d.is_verified) ?? []
  const unverified = drivers?.filter(d => !d.is_verified) ?? []

  return (
    <div>
      <PageHeader
        title="기사 인증 관리"
        description={`전체 ${drivers?.length ?? 0}명 · 인증 ${verified.length}명 · 미인증 ${unverified.length}명`}
      />

      {/* 미인증 먼저 */}
      {unverified.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg inline-block mb-3">
            ⏳ 인증 대기 {unverified.length}명
          </h2>
          <div className="grid gap-4">
            {unverified.map((d: any) => (
              <DriverCard key={d.id} driver={d} onVerify={verifyDriver} onUnverify={unverifyDriver} />
            ))}
          </div>
        </div>
      )}

      {verified.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block mb-3">
            ✓ 인증 완료 {verified.length}명
          </h2>
          <div className="grid gap-4">
            {verified.map((d: any) => (
              <DriverCard key={d.id} driver={d} onVerify={verifyDriver} onUnverify={unverifyDriver} />
            ))}
          </div>
        </div>
      )}

      {(!drivers || drivers.length === 0) && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-3">🚚</p>
          <p className="text-sm">등록된 기사가 없습니다</p>
        </div>
      )}
    </div>
  )
}

function DriverCard({
  driver,
  onVerify,
  onUnverify,
}: {
  driver: any
  onVerify: (id: string) => Promise<void>
  onUnverify: (id: string) => Promise<void>
}) {
  const user = driver.users
  return (
    <div className={`bg-white rounded-2xl border p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-5 ${driver.is_verified ? "border-emerald-100" : "border-amber-100"}`}>
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
          driver.is_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}>
          {user?.name?.[0] ?? "기"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <a href={`/driver/${user?.id}`} target="_blank" rel="noopener noreferrer"
              className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-sm">
              {user?.name} ↗
            </a>
            {driver.is_verified
              ? <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">인증</span>
              : <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">미인증</span>
            }
          </div>
          <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5">
            <span>{driver.vehicle_type} · {driver.vehicle_number}</span>
            {driver.business_number && <span>사업자: {driver.business_number}</span>}
            <span>{user?.email}</span>
            {user?.phone && <span>{user.phone}</span>}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            평점 {driver.rating_avg.toFixed(1)} ({driver.rating_count}건) · 가입 {new Date(user?.created_at).toLocaleDateString("ko-KR")}
          </div>
        </div>
      </div>
      <div className="shrink-0 sm:ml-auto">
        {driver.is_verified ? (
          <form action={unverifyDriver.bind(null, driver.id)}>
            <button type="submit" className="text-xs text-gray-400 hover:text-red-600 border border-gray-200 px-4 py-2.5 min-h-[44px] sm:min-h-0 sm:py-1.5 rounded-lg hover:border-red-200 transition-colors w-full sm:w-auto">
              인증 취소
            </button>
          </form>
        ) : (
          <form action={verifyDriver.bind(null, driver.id)}>
            <button type="submit" className="text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 min-h-[44px] sm:min-h-0 sm:py-1.5 rounded-lg font-semibold transition-colors w-full sm:w-auto">
              인증하기
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
