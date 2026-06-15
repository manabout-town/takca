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
    .select("id, origin, destination, cargo_type, price, is_urgent, created_at, vehicle_type")
    .eq("status", "pending")
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6)

  const urgentCount = recentOrders?.filter(o => o.is_urgent).length || 0

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🚛</span>
            <span className="font-bold text-blue-700 text-xl">화물로</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/intro" className="hover:text-blue-600 transition-colors">서비스 소개</Link>
            <a href="#orders" className="hover:text-blue-600 transition-colors">의뢰 현황</a>
            <a href="#quick" className="hover:text-blue-600 transition-colors">신속 의뢰</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">로그인</Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">회원가입</Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                현재 {recentOrders?.length || 0}건 대기 중 · 긴급 {urgentCount}건
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
                화물 운송<br /><span className="text-yellow-400">플랫폼 #1</span>
              </h1>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                화주와 기사를 직접 연결합니다.<br />에스크로 안전결제 · 실시간 채팅 · 매칭 성공률 94.7%
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/signup?role=shipper" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-6 py-3.5 rounded-xl font-bold transition-all text-center">의뢰 등록하기 →</Link>
                <Link href="/signup?role=driver" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3.5 rounded-xl font-semibold transition-all text-center">기사로 일하기</Link>
              </div>
            </div>
            <div className="hidden md:block space-y-3">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🏢</span>
                  <div>
                    <div className="font-semibold">빠른 의뢰 등록</div>
                    <div className="text-xs text-blue-200">화주 전용 · 평균 47분 내 매칭</div>
                  </div>
                </div>
                <Link href="/signup?role=shipper" className="block bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-center py-2.5 rounded-xl text-sm font-bold transition-colors">무료로 시작하기</Link>
              </div>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚛</span>
                  <div className="flex-1">
                    <div className="font-semibold">의뢰 피드 보기</div>
                    <div className="text-xs text-blue-200">기사 전용 · 실시간 업데이트</div>
                  </div>
                  {urgentCount > 0 && <div className="bg-orange-400 text-white text-xs px-2.5 py-1 rounded-full font-bold">긴급 {urgentCount}건</div>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[{ num: "94.7%", label: "매칭률" }, { num: "47분", label: "평균 매칭" }, { num: "4.8점", label: "기사 평점" }].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl py-3">
                    <div className="font-bold text-yellow-300">{s.num}</div>
                    <div className="text-blue-200 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100 py-5 sticky top-16 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 text-sm">🔍</span>
              <input type="text" placeholder="출발지, 도착지, 화물 종류로 검색..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" readOnly />
            </div>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors">검색하기</Link>
          </div>
          <div className="flex gap-3 mt-2.5 max-w-3xl mx-auto text-xs text-gray-400">
            <span>인기:</span>
            {["서울 → 부산", "냉동 화물", "1톤 트럭", "긴급 운송", "이사짐"].map(tag => (
              <Link key={tag} href="/signup" className="hover:text-blue-600 transition-colors">{tag}</Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-blue-200 mb-1 font-semibold uppercase tracking-wide">화주 전용</div>
                  <h2 className="text-xl font-bold mb-1">지금 바로 의뢰를 등록하세요</h2>
                  <p className="text-blue-100 text-sm">전국의 검증된 기사님들이 빠르게 수락합니다</p>
                </div>
                <Link href="/signup?role=shipper" className="flex-shrink-0 bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-5 py-3 rounded-xl font-bold text-sm transition-colors">의뢰 등록 →</Link>
              </div>
            </div>

            <div id="quick" className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚡</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">신속 의뢰</h3>
                    <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">+1,000원</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">오늘 당장 화물을 이동해야 하나요? 긴급 부스팅을 사용하면 피드 최상단에 노출되어 기사님들의 우선 확인을 받을 수 있습니다. 평균 매칭 시간 <strong>3분</strong>.</p>
                  <Link href="/signup?role=shipper" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">긴급 의뢰 등록하기 →</Link>
                </div>
              </div>
            </div>

            <div id="orders">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">실시간 의뢰 현황</h2>
                <Link href="/signup" className="text-sm text-blue-600 hover:text-blue-700 font-medium">전체 보기 →</Link>
              </div>
              <div className="space-y-3">
                {recentOrders && recentOrders.length > 0 ? recentOrders.map((order) => (
                  <Link key={order.id} href="/signup" className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          {order.is_urgent && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-semibold">⚡ 긴급</span>}
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{order.cargo_type}</span>
                          {order.vehicle_type && <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">🚛 {order.vehicle_type}</span>}
                        </div>
                        <div className="font-semibold text-sm text-gray-900">
                          <span className="text-blue-600">📍</span> {order.origin} <span className="text-gray-400 mx-1">→</span> <span className="text-orange-600">📍</span> {order.destination}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(order.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="font-bold text-blue-700 text-lg">{order.price.toLocaleString()}원</div>
                        <div className="text-xs text-green-600 mt-0.5">● 매칭 대기</div>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">📋</div>
                    <div className="font-medium">현재 등록된 의뢰가 없습니다</div>
                    <div className="text-sm mt-1">첫 번째로 의뢰를 등록해 보세요</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📋</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">일반 의뢰</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">일정에 여유가 있다면 일반 의뢰를 등록해 더 많은 기사님들이 확인할 수 있도록 하세요. 의뢰 등록은 완전 무료입니다.</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["출발지 → 도착지", "화물 종류 선택", "필요 차량 선택", "희망 금액 입력"].map((step, i) => (
                      <div key={step} className="flex items-center gap-1.5 bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-xs text-gray-700">
                        <span className="w-4 h-4 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-[10px]">{i+1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                  <Link href="/signup?role=shipper" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">의뢰 등록하기 →</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">🚀 시작하기</h3>
              <div className="space-y-3">
                <Link href="/signup?role=shipper" className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
                  <span className="text-2xl">🏢</span>
                  <div><div className="font-semibold text-sm text-gray-900">화주로 가입</div><div className="text-xs text-gray-500">의뢰 등록 무료 · 즉시 시작</div></div>
                </Link>
                <Link href="/signup?role=driver" className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-100">
                  <span className="text-2xl">🚛</span>
                  <div><div className="font-semibold text-sm text-gray-900">기사로 가입</div><div className="text-xs text-gray-500">가입비 없음 · 바로 활동</div></div>
                </Link>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <span className="text-xs text-gray-400">이미 계정이 있으신가요? </span>
                <Link href="/login" className="text-xs text-blue-600 font-medium hover:text-blue-700">로그인</Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-sm">
              <h3 className="font-bold mb-4">📊 플랫폼 현황</h3>
              <div className="space-y-3">
                {[
                  { label: "매칭 성공률", value: "94.7%" },
                  { label: "평균 매칭 시간", value: "47분" },
                  { label: "평균 기사 평점", value: "4.8점" },
                  { label: "누적 거래 건수", value: "1,247건" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-blue-200">{s.label}</span>
                    <span className="font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/intro#stats" className="mt-4 block text-center text-xs text-blue-200 hover:text-white transition-colors">자세한 현황 보기 →</Link>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-5 text-white shadow-sm">
              <div className="text-xs text-purple-200 mb-2 font-semibold uppercase tracking-wide">광고</div>
              <h3 className="font-bold mb-2">화물로 프리미엄</h3>
              <p className="text-sm text-purple-100 mb-4 leading-relaxed">월 정기 구독으로 긴급 부스팅 무제한 + 우선 노출 혜택을 받으세요.</p>
              <a href="#" className="inline-block bg-white text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors">자세히 보기</a>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-semibold">파트너 화주 업체</div>
              <div className="space-y-3">
                {[
                  { name: "서울물류㈜", orders: "월 45건 의뢰", rating: "4.9", badge: "인기" },
                  { name: "동방화물", orders: "월 32건 의뢰", rating: "4.8", badge: null },
                  { name: "한국통운", orders: "월 28건 의뢰", rating: "4.7", badge: null },
                ].map((company) => (
                  <div key={company.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">{company.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className="text-sm font-semibold text-gray-900 truncate">{company.name}</div>
                        {company.badge && <span className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-bold">{company.badge}</span>}
                      </div>
                      <div className="text-xs text-gray-400">{company.orders}</div>
                    </div>
                    <div className="text-xs text-yellow-600 font-bold">⭐ {company.rating}</div>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="mt-3 block text-center text-xs text-blue-600 hover:text-blue-700 font-medium">파트너 화주 전체 보기 →</Link>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-gray-50 border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
            {[
              { icon: "🔒", label: "에스크로 결제" }, { icon: "⚡", label: "긴급 부스팅" },
              { icon: "💬", label: "실시간 채팅" }, { icon: "🚛", label: "차량 맞춤 매칭" },
              { icon: "⭐", label: "상호 평가" }, { icon: "📍", label: "경로 지도" },
            ].map((f) => (
              <Link key={f.label} href="/intro" className="group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{f.icon}</div>
                <div className="text-xs text-gray-600 font-medium group-hover:text-blue-600 transition-colors">{f.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2"><span className="text-2xl">🚛</span><span className="font-bold text-white text-lg">화물로</span></div>
            <div className="flex gap-6 text-sm">
              <Link href="/intro" className="hover:text-white transition-colors">서비스 소개</Link>
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-white transition-colors">고객센터</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-xs text-center">© 2024 화물로. 모든 거래는 에스크로로 보호됩니다.</div>
        </div>
      </footer>
    </div>
  )
}
