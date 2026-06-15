import Link from "next/link"

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🚛</span>
            <span className="font-bold text-blue-700 text-xl">화물로</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">기능 소개</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">이용 방법</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">요금 정책</a>
            <a href="#stats" className="hover:text-blue-600 transition-colors">플랫폼 현황</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">로그인</Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">무료로 시작하기</Link>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-400 blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-indigo-400 blur-3xl opacity-20"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm mb-8 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              카카오 오픈채팅을 넘어서는 정식 화물 중개 플랫폼
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              화물 운송,<br />
              <span className="text-yellow-400">더 쉽고 안전하게</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl leading-relaxed">
              화주와 기사를 직접 연결합니다. 에스크로 안전결제로 믿을 수 있고, 실시간 채팅으로 소통이 편리합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup?role=shipper" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold transition-all text-center shadow-lg">화주로 시작하기 →</Link>
              <Link href="/signup?role=driver" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all text-center">기사로 등록하기</Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 0C480 0 240 60 0 20L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      <section id="stats" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">📊 플랫폼 현황</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">화물로 수익 지표</h2>
            <p className="text-gray-500 max-w-lg mx-auto">누적 데이터를 기반으로 한 실제 성과 지표입니다</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: "94.7%", label: "매칭 성공률", sub: "의뢰 → 기사 매칭", icon: "🎯", color: "blue" },
              { num: "47분", label: "평균 매칭 시간", sub: "의뢰 등록 후 기준", icon: "⏱️", color: "green" },
              { num: "4.8점", label: "평균 기사 평점", sub: "5점 만점 기준", icon: "⭐", color: "yellow" },
              { num: "99.2%", label: "안전 결제율", sub: "에스크로 보호 기준", icon: "🔒", color: "purple" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl p-6 text-center border-2 ${s.color === "blue" ? "bg-blue-50 border-blue-100" : s.color === "green" ? "bg-green-50 border-green-100" : s.color === "yellow" ? "bg-yellow-50 border-yellow-100" : "bg-purple-50 border-purple-100"}`}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className={`text-3xl font-bold mb-1 ${s.color === "blue" ? "text-blue-600" : s.color === "green" ? "text-green-600" : s.color === "yellow" ? "text-yellow-600" : "text-purple-600"}`}>{s.num}</div>
                <div className="font-semibold text-gray-900 text-sm">{s.label}</div>
                <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: "1,247건", label: "누적 거래 건수" },
              { num: "₩2.4억", label: "누적 거래액" },
              { num: "438명", label: "등록 기사 수" },
              { num: "3분", label: "긴급 부스팅 평균 매칭" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-gray-900">{s.num}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">✨ 핵심 기능</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">왜 화물로인가요?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">기존 카카오 오픈채팅 방식의 불편함을 해소하고, 안전하고 투명한 화물 운송 생태계를 만들어 갑니다.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🔒", title: "에스크로 안전결제", desc: "결제금을 플랫폼이 안전하게 보관합니다. 운송 완료 확인 후 기사님께 지급되어 양측 모두 안심할 수 있습니다.", highlight: "100% 안전 보장", color: "blue" },
              { icon: "⚡", title: "긴급 부스팅", desc: "1,000원으로 피드 상단에 노출됩니다. 평균 매칭 시간이 47분에서 3분으로 단축됩니다.", highlight: "최대 15배 빠른 매칭", color: "orange" },
              { icon: "💬", title: "실시간 1:1 채팅", desc: "매칭 즉시 화주-기사 간 1:1 채팅방이 자동으로 열립니다. 운송 세부사항을 편하게 조율하세요.", highlight: "즉시 연결", color: "green" },
              { icon: "🚛", title: "차량 맞춤 매칭", desc: "다마스부터 25톤 트럭까지 9가지 차량 유형 중 화물에 맞는 차량을 지정해서 의뢰를 등록할 수 있습니다.", highlight: "9가지 차량 유형", color: "blue" },
              { icon: "📍", title: "경로 지도 시각화", desc: "출발지-도착지 경로를 직관적인 지도로 확인할 수 있어 기사님이 운행 계획을 세우기 편리합니다.", highlight: "실시간 경로 확인", color: "purple" },
              { icon: "⭐", title: "상호 평가 시스템", desc: "운송 완료 후 화주와 기사가 서로 평가합니다. 신뢰할 수 있는 거래 파트너를 쉽게 찾을 수 있습니다.", highlight: "투명한 신뢰 시스템", color: "yellow" },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{f.icon}</div>
                <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${f.color === "blue" ? "bg-blue-50 text-blue-700" : f.color === "orange" ? "bg-orange-50 text-orange-700" : f.color === "green" ? "bg-green-50 text-green-700" : f.color === "purple" ? "bg-purple-50 text-purple-700" : "bg-yellow-50 text-yellow-700"}`}>{f.highlight}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">📖 이용 방법</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">어떻게 사용하나요?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-blue-100">🏢 화주 이용 방법</div>
              <div className="space-y-6">
                {[
                  { step: "01", title: "의뢰 등록", desc: "출발지, 도착지, 화물 종류, 필요 차량, 희망 금액을 입력합니다. 긴급 부스팅으로 더 빠른 매칭도 가능합니다." },
                  { step: "02", title: "기사 매칭", desc: "기사님이 의뢰를 수락하면 자동으로 1:1 채팅방이 생성됩니다." },
                  { step: "03", title: "에스크로 결제", desc: "운송 시작 전 에스크로로 결제합니다. 완료 전까지 자금은 플랫폼이 보관합니다." },
                  { step: "04", title: "운송 완료 확인", desc: "물건을 받은 후 완료 확인을 누르면 기사님께 대금(4% 수수료 제외)이 자동 지급됩니다." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">{item.step}</div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                      <div className="text-sm text-gray-500 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/signup?role=shipper" className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">화주로 시작하기 →</Link>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-green-100">🚛 기사 이용 방법</div>
              <div className="space-y-6">
                {[
                  { step: "01", title: "기사 등록", desc: "차량 번호, 차량 종류를 등록하고 기사로 가입합니다. 빠른 심사 후 바로 활동 가능합니다." },
                  { step: "02", title: "의뢰 피드 확인", desc: "실시간 의뢰 피드에서 내 차량에 맞는 의뢰를 확인합니다. 경로, 금액, 화물 종류로 필터링하세요." },
                  { step: "03", title: "의뢰 수락 & 채팅", desc: "마음에 드는 의뢰를 수락하면 화주와 1:1 채팅이 시작됩니다." },
                  { step: "04", title: "운송 완료 & 정산", desc: "운송 완료 후 화주의 확인을 받으면 수수료(4%)를 제한 금액이 자동으로 정산됩니다." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">{item.step}</div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                      <div className="text-sm text-gray-500 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/signup?role=driver" className="mt-8 inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">기사로 등록하기 →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-white/20">📱 웹 & 앱</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">언제 어디서나 화물로</h2>
            <p className="text-slate-300 max-w-lg mx-auto">PC 웹과 모바일 웹 모두 완벽 지원. 현장에서 스마트폰으로 바로 의뢰하고 수락하세요.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🖥️", title: "PC 웹", desc: "대시보드, 의뢰 관리, 분쟁 처리 등 모든 기능을 넓은 화면에서 편리하게 사용하세요.", tags: ["대시보드", "의뢰 관리", "채팅", "정산"] },
              { icon: "📱", title: "모바일 웹", desc: "현장에서 바로 의뢰 등록, 수락, 채팅까지 모바일 최적화 UI로 빠르게 처리하세요.", tags: ["의뢰 등록", "빠른 수락", "채팅", "알림"] },
              { icon: "🔔", title: "실시간 알림", desc: "새 의뢰, 매칭 완료, 결제 정산 등 중요한 이벤트를 실시간으로 알려드립니다.", tags: ["매칭 알림", "결제 알림", "채팅 알림"] },
            ].map((f) => (
              <div key={f.title} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">{f.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {f.tags.map((tag) => (<span key={tag} className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full border border-white/20">{tag}</span>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">💰 투명한 요금</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">숨겨진 수수료 없음</h2>
            <p className="text-gray-500">딱 이것만 받습니다</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: "의뢰 등록", price: "무료", desc: "화주의 의뢰 등록은 완전 무료입니다. 건수 제한도 없습니다.", badge: null },
              { title: "긴급 부스팅", price: "1,000원", desc: "빠른 매칭을 원할 때 선택적으로 사용. 피드 상단에 즉시 노출됩니다.", badge: "선택사항" },
              { title: "거래 수수료", price: "4%", desc: "거래 완료 시에만 부과됩니다. 거래 실패 시 수수료 0원입니다.", badge: null },
            ].map((p) => (
              <div key={p.title} className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all text-center relative">
                {p.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">{p.badge}</div>}
                <div className="text-sm text-gray-500 mb-2">{p.title}</div>
                <div className="text-4xl font-bold text-blue-600 mb-4">{p.price}</div>
                <div className="text-sm text-gray-600 leading-relaxed">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-700 to-indigo-800 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-blue-100 text-lg mb-10">가입비 없이 무료로 시작할 수 있습니다</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=shipper" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-lg">화주로 시작 →</Link>
            <Link href="/signup?role=driver" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all">기사로 등록</Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">
            <div>
              <div className="flex items-center gap-2 mb-3"><span className="text-2xl">🚛</span><span className="font-bold text-white text-xl">화물로</span></div>
              <p className="text-sm leading-relaxed">화주와 기사를 직접 연결하는 스마트 화물 중개 플랫폼</p>
            </div>
            <div className="grid grid-cols-3 gap-10 text-sm">
              <div>
                <div className="text-white font-semibold mb-3">서비스</div>
                <div className="space-y-2">
                  <div><a href="#features" className="hover:text-white transition-colors">기능 소개</a></div>
                  <div><a href="#pricing" className="hover:text-white transition-colors">요금 안내</a></div>
                  <div><a href="#how-it-works" className="hover:text-white transition-colors">이용 방법</a></div>
                </div>
              </div>
              <div>
                <div className="text-white font-semibold mb-3">고객지원</div>
                <div className="space-y-2">
                  <div><a href="#" className="hover:text-white">공지사항</a></div>
                  <div><a href="#" className="hover:text-white">FAQ</a></div>
                  <div><a href="#" className="hover:text-white">1:1 문의</a></div>
                </div>
              </div>
              <div>
                <div className="text-white font-semibold mb-3">법적 정보</div>
                <div className="space-y-2">
                  <div><a href="#" className="hover:text-white">이용약관</a></div>
                  <div><a href="#" className="hover:text-white">개인정보처리방침</a></div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-8 text-sm text-center">© 2024 화물로. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
