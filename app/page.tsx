import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
    if (profile?.role === "shipper") redirect("/shipper/dashboard")
    if (profile?.role === "driver") redirect("/driver/dashboard")
    if (profile?.role === "admin") redirect("/admin/dashboard")
  }

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, origin, destination, cargo_type, price, is_urgent, created_at, vehicle_type, title")
    .eq("status", "pending")
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6)

  const urgentCount = recentOrders?.filter(o => o.is_urgent).length || 0

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg">🚛</span>
            <span className="font-bold text-gray-900 text-base tracking-tight">화물로</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <Link href="/intro" className="hover:text-gray-900 transition-colors">서비스 소개</Link>
            <a href="#orders" className="hover:text-gray-900 transition-colors">의뢰 현황</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">로그인</Link>
            <Link href="/signup" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">회원가입</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs text-gray-400 border border-gray-800 px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              실시간 대기 {recentOrders?.length || 0}건 · 긴급 {urgentCount}건
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
              화물 운송<br />
              <span className="text-gray-400">더 빠르게.</span>
            </h1>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              화주와 기사를 직접 연결하는 화물 중개 플랫폼.<br />
              에스크로 안전결제 · 실시간 채팅 · 매칭률 94.7%
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup?role=shipper" className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-colors text-center text-sm">
                의뢰 등록하기 →
              </Link>
              <Link href="/signup?role=driver" className="bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 px-6 py-3 rounded-xl font-semibold transition-colors text-center text-sm">
                기사로 시작하기
              </Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: "94.7%", label: "매칭 성공률" },
              { num: "47분", label: "평균 매칭 시간" },
              { num: "4.8", label: "기사 평균 평점" },
              { num: "1,247건", label: "누적 거래" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white">{s.num}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search bar */}
      <section className="border-b border-gray-100 py-4 sticky top-14 z-30 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 max-w-2xl">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">🔍</span>
              <input type="text" placeholder="출발지, 도착지, 화물 종류로 검색..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white" readOnly />
            </div>
            <Link href="/signup" className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors">검색</Link>
          </div>
        </div>
      </section>

      {/* Content grid */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left main column */}
          <div className="md:col-span-2 space-y-8">

            {/* Shipper CTA banner */}
            <div className="bg-gray-950 rounded-2xl p-6 text-white flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest font-medium">화주 전용</div>
                <h2 className="text-lg font-bold mb-1">지금 바로 의뢰를 등록하세요</h2>
                <p className="text-gray-400 text-sm">전국의 검증된 기사님들이 빠르게 응합니다</p>
              </div>
              <Link href="/signup?role=shipper" className="flex-shrink-0 bg-white hover:bg-gray-100 text-gray-900 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                등록하기 →
              </Link>
            </div>

            {/* Urgent section */}
            <div id="quick" className="border border-amber-200 bg-amber-50/50 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-2xl">⚡</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900">신속 의뢰</h3>
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-semibold">+1,000원</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">긴급 부스팅을 사용하면 피드 최상단에 노출되어 평균 <strong>3분</strong> 내 매칭됩니다.</p>
                  <Link href="/signup?role=shipper" className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">긴급 의뢰 등록 →</Link>
                </div>
              </div>
            </div>

            {/* Live orders */}
            <div id="orders">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">실시간 의뢰 현황</h2>
                <Link href="/signup" className="text-sm text-gray-400 hover:text-gray-700">전체 보기 →</Link>
              </div>
              <div className="space-y-2">
                {recentOrders && recentOrders.length > 0 ? recentOrders.map((order) => (
                  <Link key={order.id} href="/signup" className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {order.is_urgent && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">긴급</span>}
                        <span className="text-xs text-gray-400">{order.cargo_type}</span>
                        {order.vehicle_type && <span className="text-xs text-gray-400">· {order.vehicle_type}</span>}
                      </div>
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {order.origin} <span className="text-gray-300 mx-1">→</span> {order.destination}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-gray-900 text-sm">{order.price.toLocaleString()}원</div>
                      <div className="text-[10px] text-emerald-600 mt-0.5">대기 중</div>
                    </div>
                  </Link>
                )) : (
                  <div className="text-center py-14 text-gray-400">
                    <div className="text-4xl mb-3">📋</div>
                    <div className="text-sm">현재 등록된 의뢰가 없습니다</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Signup cards */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">시작하기</h3>
              <div className="space-y-2">
                <Link href="/signup?role=shipper" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors">
                  <span className="text-xl">🏢</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">화주로 가입</div>
                    <div className="text-xs text-gray-400">의뢰 등록 무료</div>
                  </div>
                </Link>
                <Link href="/signup?role=driver" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors">
                  <span className="text-xl">🚛</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">기사로 가입</div>
                    <div className="text-xs text-gray-400">가입비 없음</div>
                  </div>
                </Link>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <span className="text-xs text-gray-400">이미 계정이 있으신가요? </span>
                <Link href="/login" className="text-xs text-gray-900 font-semibold hover:underline">로그인</Link>
              </div>
            </div>

            {/* Platform stats */}
            <div className="bg-gray-950 rounded-2xl p-5 text-white">
              <h3 className="font-semibold mb-4 text-sm">플랫폼 현황</h3>
              <div className="space-y-3">
                {[
                  { label: "매칭 성공률", value: "94.7%" },
                  { label: "평균 매칭 시간", value: "47분" },
                  { label: "기사 평균 평점", value: "4.8점" },
                  { label: "누적 거래", value: "1,247건" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad banner */}
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest">프리미엄</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1.5">화물로 프리미엄</h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">긴급 부스팅 무제한 + 우선 노출 혜택</p>
              <a href="#" className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors">자세히 보기</a>
            </div>

            {/* Partner shippers */}
            <div className="border border-gray-100 rounded-2xl p-5">
              <div className="text-[10px] text-gray-400 mb-3 uppercase tracking-widest">파트너 화주</div>
              <div className="space-y-3">
                {[
                  { name: "서울물류㈜", orders: "월 45건", rating: "4.9" },
                  { name: "동방화물", orders: "월 32건", rating: "4.8" },
                  { name: "한국통운", orders: "월 28건", rating: "4.7" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{c.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{c.name}</div>
                      <div className="text-xs text-gray-400">{c.orders}</div>
                    </div>
                    <div className="text-xs text-gray-500">⭐ {c.rating}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <section className="border-t border-gray-100 py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 text-center">
            {[
              { icon: "🔒", label: "에스크로 결제" },
              { icon: "⚡", label: "긴급 부스팅" },
              { icon: "💬", label: "실시간 채팅" },
              { icon: "🚛", label: "차량 맞춤 매칭" },
              { icon: "⭐", label: "상호 평가" },
              { icon: "📍", label: "경로 확인" },
            ].map((f) => (
              <Link key={f.label} href="/intro" className="group">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{f.icon}</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors">{f.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚛</span>
            <span className="font-bold text-white text-sm tracking-tight">화물로</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/intro" className="hover:text-white transition-colors">서비스 소개</Link>
            <a href="#" className="hover:text-white transition-colors">이용약관</a>
            <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
          </div>
          <div className="text-xs">© 2024 화물로</div>
        </div>
      </footer>
    </div>
  )
}
