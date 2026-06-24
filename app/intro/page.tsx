import Link from "next/link"
import { Logo } from "@/components/shared/Logo"

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-gray-900 transition-colors">기능</a>
            <a href="#how" className="hover:text-gray-900 transition-colors">이용 방법</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">요금</a>
            <a href="#stats" className="hover:text-gray-900 transition-colors">현황</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2.5 min-h-[44px] flex items-center transition-colors">로그인</Link>
            <Link href="/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 min-h-[44px] flex items-center rounded-lg text-sm font-semibold transition-colors">시작하기</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gray-950 text-white py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-400 border border-gray-800 px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            실시간 운영 중
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-5">
            화물 운송,<br />
            <span className="text-gray-500">더 스마트하게.</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-md mx-auto mb-10 leading-relaxed">
            화주와 기사를 직접 연결하는 디지털 화물 중개 플랫폼
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup?role=shipper" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 min-h-[44px] rounded-xl font-semibold transition-colors text-sm">
              화주로 시작하기 →
            </Link>
            <Link href="/signup?role=driver" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 min-h-[44px] rounded-xl font-semibold transition-colors text-sm">
              기사로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {[
            { num: "94.7%", label: "매칭 성공률" },
            { num: "47분", label: "평균 매칭 시간" },
            { num: "4.8점", label: "기사 평균 평점" },
            { num: "1,247건", label: "누적 거래" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{s.num}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">핵심 기능</h2>
            <p className="text-gray-400">운송 업무를 더 쉽고 안전하게 만드는 기능들</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: "🔒", title: "에스크로 결제", desc: "거래 완료까지 결제금을 안전하게 보호합니다. 사기 걱정 없이 거래하세요." },
              { icon: "⚡", title: "긴급 부스팅", desc: "1,000원으로 피드 최상단 노출. 평균 3분 내 기사님이 응합니다." },
              { icon: "💬", title: "실시간 채팅", desc: "매칭 즉시 화주-기사 1:1 채팅방 개설. 모든 소통을 한 곳에서." },
              { icon: "🚚", title: "차량 맞춤 매칭", desc: "화물 종류와 무게에 맞는 최적 차량을 자동으로 필터링합니다." },
              { icon: "📍", title: "경로 시각화", desc: "출발지와 도착지를 직관적으로 확인. 운송 루트를 한눈에 파악하세요." },
              { icon: "⭐", title: "상호 평가", desc: "운송 완료 후 화주와 기사가 서로를 평가하는 신뢰 시스템." },
            ].map(f => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">이용 방법</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-widest">화주</div>
              <div className="space-y-5">
                {["회원가입 (무료)", "의뢰 등록 — 출발/도착/화물/금액 입력", "기사 매칭 알림 수신", "에스크로 결제 후 운송 완료"].map((s, i) => (
                  <div key={s} className="flex items-start gap-4">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-sm text-gray-600 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-widest">기사</div>
              <div className="space-y-5">
                {["회원가입 — 차량 정보 등록", "의뢰 피드에서 원하는 의뢰 수락", "화주와 채팅으로 픽업 일정 조율", "운송 완료 후 에스크로 정산 (4% 수수료)"].map((s, i) => (
                  <div key={s} className="flex items-start gap-4">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-sm text-gray-600 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">투명한 요금</h2>
            <p className="text-gray-400">숨겨진 수수료 없이 명확하게</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "의뢰 등록", price: "무료", desc: "화주의 의뢰 등록은 언제나 무료입니다.", badge: null },
              { title: "긴급 부스팅", price: "1,000원", desc: "피드 상단 노출로 빠른 매칭을 원할 때만 사용하세요.", badge: "선택" },
              { title: "플랫폼 수수료", price: "4%", desc: "거래 완료 시 기사 수익에서 자동 정산됩니다.", badge: null },
            ].map(p => (
              <div key={p.title} className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">{p.title}</h3>
                  {p.badge && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{p.badge}</span>}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{p.price}</div>
                <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-950 text-white text-center">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">지금 시작하세요</h2>
          <p className="text-gray-400 mb-10 text-sm md:text-base">가입비, 월정액 없음. 지금 바로 무료로 시작할 수 있습니다.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup?role=shipper" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 min-h-[44px] rounded-xl font-semibold transition-colors text-sm">
              화주로 시작하기
            </Link>
            <Link href="/signup?role=driver" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 min-h-[44px] rounded-xl font-semibold transition-colors text-sm">
              기사로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
          <Logo variant="light" />
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400 transition-colors">이용약관</a>
            <a href="#" className="hover:text-gray-400 transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-gray-400 transition-colors">고객센터</a>
          </div>
          <div className="text-xs text-gray-700">© 2026 탁카 (TakCa)</div>
        </div>
      </footer>
    </div>
  )
}
