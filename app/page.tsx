"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { LandingHeader } from "@/components/shared/LandingHeader"

// ─── Static landing page (no SSR data fetch — use Suspense wrapper if needed) ───

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      <LandingHeader />

      {/* ══════════════════════════════════════════
          HERO — Higgsfield AI generated background
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden pt-[60px]">

        {/* Higgsfield AI 생성 히어로 배경 */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.png"
            alt=""
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
          {/* Deep overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-950/50 to-gray-950/90" />
          {/* Orange glow center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] rounded-full bg-orange-500/8 blur-3xl" />
          </div>
        </div>

        {/* Animated route SVG overlay (on top of photo) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1600 900">
          <path d="M -50 320 Q 300 120 650 310 Q 950 480 1250 240 L 1650 290"
            stroke="white" strokeOpacity="0.06" strokeWidth="1.5" fill="none" />
          <path d="M -50 520 Q 350 320 720 490 Q 1050 640 1350 420 L 1650 460"
            stroke="white" strokeOpacity="0.04" strokeWidth="1" fill="none" />
          <circle r="3.5" fill="#f97316" opacity="0.9">
            <animateMotion dur="9s" repeatCount="indefinite"
              path="M -50 320 Q 300 120 650 310 Q 950 480 1250 240 L 1650 290" />
          </circle>
          <circle r="3" fill="#818cf8" opacity="0.8">
            <animateMotion dur="11s" repeatCount="indefinite" begin="2s"
              path="M -50 520 Q 350 320 720 490 Q 1050 640 1350 420 L 1650 460" />
          </circle>
        </svg>

        {/* ── HERO CONTENT ── */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto w-full">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white/6 border border-white/10
            text-gray-300 text-xs px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            실시간 운영 중 · 전국 카 캐리어 탁송 중개 플랫폼
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[4.5rem] lg:text-[5.5rem] font-extrabold text-white
            tracking-tight mb-5 leading-[1.06]">
            카 캐리어 직거래,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
              평균 47분 매칭.
            </span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-lg mx-auto mb-4 leading-relaxed">
            딜러사·경매장·리스업체·개인 화주 ↔ 전국 카 캐리어 기사<br />
            수수료 4% · 에스크로 안전결제 · 의뢰 등록 무료
          </p>

          {/* ── 나는 누구인가요? 즉시 선택 ── */}
          <p className="text-xs text-gray-500 mb-4 font-medium">나는 누구인가요?</p>
          <RoleSelector />

          {/* Mini trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-10 text-[11px] text-gray-400">
            {[
              "✓ 가입비 없음",
              "✓ 의뢰 등록 무료",
              "✓ 에스크로 안전결제 (토스페이먼츠)",
              "✓ 전국 서비스 (서울~부산~제주)",
            ].map(t => <span key={t}>{t}</span>)}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-700">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-gray-700" />
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {[
            { num: "94.7%", label: "매칭 성공률", sub: "전국 카 캐리어 네트워크*" },
            { num: "47분", label: "평균 매칭 시간", sub: "긴급 건 3분 이내*" },
            { num: "4.8점", label: "기사 평균 평점", sub: "5점 만점*" },
            { num: "4%", label: "거래 수수료", sub: "의뢰 등록 무료" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-1 tabular-nums">{s.num}</div>
              <div className="text-sm font-semibold text-gray-700 mb-0.5">{s.label}</div>
              <div className="text-xs text-gray-400">{s.sub}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-gray-500 pb-4">* 내부 집계 기준</p>
      </section>

      {/* ══════════════════════════════════════════
          SOCIAL PROOF — 실사용자 후기
      ══════════════════════════════════════════ */}
      <TestimonialsSection />

      {/* ══════════════════════════════════════════
          ABOUT — 서비스가 뭔지 한눈에
      ══════════════════════════════════════════ */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              탁카란?
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3">
              두 타입의 사용자를 위한 플랫폼
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto text-sm">
              화주는 탁송 의뢰를 올리고, 카 캐리어 기사는 원하는 건을 골라 수락합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">

            {/* 화주 카드 */}
            <div className="relative bg-white rounded-3xl border border-orange-100 p-6 md:p-8 overflow-hidden
              hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50 rounded-full
                translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-orange-500 text-white
                  text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                      stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
                  </svg>
                  화주 (탁송 의뢰인)
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                  차량 탁송이 필요하다면
                </h3>
                <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                  딜러사·경매장·리스업체·개인 — 의뢰만 올리면 전국 카 캐리어 기사님이 직접 연락합니다.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    { n: "01", text: "무료 의뢰 등록 — 출발지·도착지·차량 수 및 차종·희망 금액" },
                    { n: "02", text: "카 캐리어 기사 매칭 알림 수신 (평균 47분, 긴급은 3분)" },
                    { n: "03", text: "에스크로 안전결제 후 탁송 시작 (토스페이먼츠)" },
                    { n: "04", text: "인도 리포트 확인 후 자동 정산 — 다음 거래가 더 빠릅니다" },
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-md
                        flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">
                        {s.n}
                      </span>
                      <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
                <Link href="/signup?role=shipper"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400
                  text-white px-6 py-3 min-h-[44px] rounded-xl font-bold text-sm transition-all
                  hover:shadow-lg hover:shadow-orange-500/25">
                  화주로 무료 가입 →
                </Link>
              </div>
            </div>

            {/* 기사 카드 */}
            <div className="relative bg-white rounded-3xl border border-indigo-100 p-6 md:p-8 overflow-hidden
              hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full
                translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-indigo-600 text-white
                  text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <rect x="1" y="3" width="15" height="13" rx="2" stroke="white" strokeWidth="2.5"/>
                    <path d="M16 8h4l3 3v5h-7V8z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
                    <circle cx="5.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2.5"/>
                  </svg>
                  기사 (카 캐리어 기사)
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                  카 캐리어 기사라면
                </h3>
                <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                  피드에서 원하는 건만 골라 수락. 강요 없이 자유롭게.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    { n: "01", text: "가입 — 카 캐리어 차량 정보 등록 (가입비 0원)" },
                    { n: "02", text: "실시간 탁송 의뢰 피드에서 원하는 건 선택" },
                    { n: "03", text: "화주와 1:1 채팅으로 픽업 일정 조율" },
                    { n: "04", text: "탁송 완료 후 에스크로 정산 (수수료 4%)" },
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-md
                        flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">
                        {s.n}
                      </span>
                      <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
                <Link href="/signup?role=driver"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
                  text-white px-6 py-3 min-h-[44px] rounded-xl font-bold text-sm transition-all
                  hover:shadow-lg hover:shadow-indigo-500/25">
                  기사로 무료 가입 →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — 핵심 기능 한눈에
      ══════════════════════════════════════════ */}
      <section id="features" className="py-20 bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block bg-white/5 border border-white/10 text-gray-400
              text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              핵심 기능
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3">
              안심하고 거래할 수 있는 이유
            </h2>
            <p className="text-gray-500 text-sm">5가지 핵심 기능으로 화주와 카 캐리어 기사 모두를 보호합니다</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — 탭형 단계별 설명
      ══════════════════════════════════════════ */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-block bg-gray-100 text-gray-600 text-xs font-bold
              px-3 py-1.5 rounded-full mb-4">
              이용 방법
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3">
              어떻게 작동하나요?
            </h2>
            <p className="text-gray-400 text-sm">나에게 맞는 탭을 선택하세요</p>
          </div>
          <HowItWorksTabs />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LIVE ORDERS PREVIEW
      ══════════════════════════════════════════ */}
      <section id="orders" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs text-emerald-600
              bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              실시간 업데이트
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">지금 이 순간도</h2>
            <p className="text-gray-400 text-sm">전국에서 차량 탁송 의뢰가 올라오고 있습니다</p>
          </div>

          {/* Mock order cards (실제 데이터는 로그인 후 확인) */}
          <div className="space-y-3 mb-6">
            {MOCK_ORDERS.map((o, i) => (
              <div key={i}
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl border transition-all
                  ${o.urgent
                    ? "border-amber-200 bg-amber-50/60"
                    : "border-gray-100 bg-white shadow-sm"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${o.urgent ? "bg-amber-100" : "bg-gray-100"}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    className={o.urgent ? "text-amber-600" : "text-gray-500"}>
                    <rect x="1" y="3" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {o.urgent && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">긴급</span>
                    )}
                    <span className="text-xs text-gray-400">{o.cargoType}</span>
                    <span className="text-xs text-gray-300">· {o.vehicleType}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {o.origin}
                    <span className="text-gray-300 mx-1.5">→</span>
                    {o.destination}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-gray-900 tabular-nums">{o.price}</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5 font-semibold">대기 중</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA to see all */}
          <div className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 mb-4">
              전체 탁송 의뢰를 확인하고 매칭을 받으려면 가입하거나 로그인하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3
                rounded-xl text-sm font-bold transition-colors">
                회원가입하고 전체 보기 →
              </Link>
              <Link href="/login"
                className="border border-gray-200 hover:border-gray-300 text-gray-600
                px-6 py-3 rounded-xl text-sm font-bold transition-colors bg-white">
                이미 계정 있으면 로그인 →
              </Link>
              <Link href="/signup?role=driver"
                className="border border-gray-200 hover:border-gray-300 text-gray-700
                px-6 py-3 rounded-xl text-sm font-bold transition-colors bg-white">
                기사로 가입해서 수락하기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <FAQSection />

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="bg-gray-950 py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-block bg-white/5 border border-white/10 text-gray-400
            text-xs font-bold px-3 py-1.5 rounded-full mb-6">
            지금 시작하세요
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            가입비 없음.<br />
            <span className="text-orange-400">30초면 충분합니다.</span>
          </h2>
          <p className="text-gray-500 mb-12 text-sm">의뢰 등록 무료 · 에스크로 안전결제 · 평균 47분 매칭</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=shipper"
              className="group flex items-center justify-center gap-2 bg-orange-500
              hover:bg-orange-400 text-white px-8 py-4 rounded-2xl font-bold text-sm
              transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                  stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              무료로 탁송 의뢰하기
            </Link>
            <Link href="/signup?role=driver"
              className="flex items-center justify-center gap-2 border border-white/10
              hover:border-white/20 bg-white/5 hover:bg-white/10 text-white
              px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="3" width="15" height="13" rx="2" stroke="white" strokeWidth="2"/>
                <path d="M16 8h4l3 3v5h-7V8z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="5.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2"/>
                <circle cx="18.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2"/>
              </svg>
              탁송 의뢰 피드 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-gray-950 border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="3" width="15" height="13" rx="2" stroke="white" strokeWidth="2"/>
                <path d="M16 8h4l3 3v5h-7V8z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="5.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2"/>
                <circle cx="18.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-white font-bold text-sm">탁카 (TakCa)</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/intro" className="hover:text-white transition-colors">서비스 소개</Link>
            <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
          </div>
          <div className="text-xs text-gray-700">© 2026 탁카 (TakCa)</div>
        </div>
      </footer>

    </div>
  )
}

// ══════════════════════════════════════════
//  ROLE SELECTOR — client interactive
// ══════════════════════════════════════════
function RoleSelector() {
  const [hovered, setHovered] = useState<"shipper" | "driver" | null>(null)

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto w-full">
      <Link
        href="/signup?role=shipper"
        onMouseEnter={() => setHovered("shipper")}
        onMouseLeave={() => setHovered(null)}
        className={`flex-1 group rounded-2xl p-5 text-left transition-all duration-200
          border hover:scale-[1.02]
          ${hovered === "driver"
            ? "bg-white/3 border-white/6 opacity-60"
            : "bg-orange-500 border-orange-400 hover:bg-orange-400 hover:shadow-2xl hover:shadow-orange-500/30"}`}
      >
        <div className="mb-2.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="font-bold text-white text-base mb-0.5">화주로 시작</div>
        <div className="text-orange-200 text-xs mb-3">의뢰 등록 무료 · 즉시 매칭</div>
        <div className="text-xs font-bold text-white/80 group-hover:translate-x-1 transition-transform inline-block">
          시작하기 →
        </div>
      </Link>

      <Link
        href="/signup?role=driver"
        onMouseEnter={() => setHovered("driver")}
        onMouseLeave={() => setHovered(null)}
        className={`flex-1 group rounded-2xl p-5 text-left transition-all duration-200
          border hover:scale-[1.02]
          ${hovered === "shipper"
            ? "bg-white/3 border-white/6 opacity-60"
            : "bg-white/8 border-white/12 hover:bg-white/12 hover:border-white/20"}`}
      >
        <div className="mb-2.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-80">
            <rect x="1" y="3" width="15" height="13" rx="2" stroke="white" strokeWidth="1.5"/>
            <path d="M16 8h4l3 3v5h-7V8z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="5.5" cy="18.5" r="2.5" stroke="white" strokeWidth="1.5"/>
            <circle cx="18.5" cy="18.5" r="2.5" stroke="white" strokeWidth="1.5"/>
          </svg>
        </div>
        <div className="font-bold text-white text-base mb-0.5">기사로 시작</div>
        <div className="text-gray-400 text-xs mb-3">가입비 없음 · 수수료 4%</div>
        <div className="text-xs font-bold text-gray-300 group-hover:translate-x-1 transition-transform inline-block">
          피드 보기 →
        </div>
      </Link>
    </div>
  )
}

// ══════════════════════════════════════════
//  FEATURE CARD
// ══════════════════════════════════════════
const FEATURES = [
  {
    color: "text-orange-400", bg: "bg-orange-400/10", borderHover: "hover:border-orange-200",
    icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>,
    title: "픽업 전 차량 상태 리포트",
    desc: "탁송 전 기사가 차량 사진 + 체크리스트 작성. 데미지 분쟁을 원천 차단.",
    tag: "화주·기사 모두",
  },
  {
    color: "text-amber-400", bg: "bg-amber-400/10", borderHover: "hover:border-amber-200",
    icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none"/>,
    title: "앱 실시간 PUSH 알림",
    desc: "매칭·픽업·도착 알림을 앱으로 즉시 수신. 카카오톡 오픈채팅 불필요.",
    tag: "화주·기사 모두",
  },
  {
    color: "text-blue-400", bg: "bg-blue-400/10", borderHover: "hover:border-blue-200",
    icon: <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>,
    title: "에스크로 디지털 결제",
    desc: "토스페이먼츠 에스크로 보관. 인도 확인 or 72시간 후 자동 정산.",
    tag: "화주·기사 모두",
  },
  {
    color: "text-emerald-400", bg: "bg-emerald-400/10", borderHover: "hover:border-emerald-200",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5"/>
      </>
    ),
    title: "사전 예약 오더",
    desc: "긴급 탁송 + 일반 사전 예약 모두 지원. 원하는 날짜에 미리 확정.",
    tag: "화주 전용",
  },
  {
    color: "text-red-400", bg: "bg-red-400/10", borderHover: "hover:border-red-200",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    title: "취소 패널티 자동 부과",
    desc: "기사 갑작스런 취소 방지. 12시간 이내 20% / 당일 30% 패널티 자동 적용.",
    tag: "화주 보호",
  },
  {
    color: "text-yellow-400", bg: "bg-yellow-400/10", borderHover: "hover:border-yellow-200",
    icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>,
    title: "상호 평가",
    desc: "완료 후 화주·기사 양쪽 평가. 신뢰 기반 카 캐리어 거래.",
    tag: "화주·기사 모두",
  },
]

function FeatureCard({ color, bg, borderHover, icon, title, desc, tag }: typeof FEATURES[0]) {
  return (
    <div className={`bg-white/5 border border-white/8 rounded-2xl p-6
      hover:bg-white/[0.08] transition-all group ${borderHover} hover:border-opacity-40
      hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <svg width="20" height="20" viewBox="0 0 24 24" className={color}>{icon}</svg>
        </div>
        <span className="text-[10px] font-bold text-gray-600 bg-white/5 border border-white/8
          px-2 py-1 rounded-full">{tag}</span>
      </div>
      <h3 className="font-bold text-white mb-2 text-sm">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

// ══════════════════════════════════════════
//  HOW IT WORKS TABS
// ══════════════════════════════════════════
const HOW_STEPS = {
  shipper: [
    { icon: "📝", title: "의뢰 등록", desc: "출발지·도착지·차량 수 및 차종·희망 금액 입력 후 등록. 5분이면 충분.", action: "의뢰 등록하기 →", href: "/signup?role=shipper" },
    { icon: "🔔", title: "카 캐리어 매칭 알림", desc: "전국 카 캐리어 기사님들이 의뢰를 보고 직접 수락합니다. 평균 47분.", action: null, href: null },
    { icon: "📸", title: "픽업 리포트 확인", desc: "기사님이 픽업 전 차량 상태 사진 + 체크리스트를 제출합니다. 데미지 분쟁 방지.", action: null, href: null },
    { icon: "✅", title: "인도 리포트 & 정산", desc: "탁송 완료 후 인도 리포트 확인. 에스크로 자동 정산 (확인 후 or 72시간).", action: "지금 시작하기 →", href: "/signup?role=shipper" },
  ],
  driver: [
    { icon: "🚚", title: "카 캐리어 정보 등록", desc: "가입 후 카 캐리어 차량 정보와 운행 지역을 등록합니다. 가입비 없음.", action: "기사 가입하기 →", href: "/signup?role=driver" },
    { icon: "📋", title: "탁송 의뢰 피드 확인", desc: "실시간으로 올라오는 탁송 의뢰 중 내 경로에 맞는 건을 선택합니다.", action: null, href: null },
    { icon: "📷", title: "픽업 리포트 제출", desc: "차량 픽업 전 상태 사진 촬영 + 체크리스트 작성. 인도 시에도 동일.", action: null, href: null },
    { icon: "💰", title: "에스크로 정산", desc: "탁송 완료 후 자동 정산. 수수료 4%만 차감 후 즉시 입금.", action: "지금 시작하기 →", href: "/signup?role=driver" },
  ],
}

function HowItWorksTabs() {
  const [tab, setTab] = useState<"shipper" | "driver">("shipper")
  const steps = HOW_STEPS[tab]

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        <button
          onClick={() => setTab("shipper")}
          className={`flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all
            ${tab === "shipper"
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          화주 (탁송 의뢰인)
        </button>
        <button
          onClick={() => setTab("driver")}
          className={`flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all
            ${tab === "driver"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="1" y="3" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
            <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
          </svg>
          카 캐리어 기사
        </button>
      </div>

      {/* Steps */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((s, i) => (
          <div key={i} className="relative">
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-full w-full h-px
                bg-gradient-to-r from-gray-200 to-transparent z-10" />
            )}
            <div className={`bg-white rounded-2xl border p-5 h-full transition-all hover:-translate-y-1 hover:shadow-md
              ${tab === "shipper" ? "border-orange-100 hover:border-orange-200" : "border-indigo-100 hover:border-indigo-200"}`}>
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className={`text-[10px] font-extrabold mb-1.5
                ${tab === "shipper" ? "text-orange-500" : "text-indigo-500"}`}>
                STEP {String(i + 1).padStart(2, "0")}
              </div>
              <div className="font-bold text-gray-900 text-sm mb-2">{s.title}</div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{s.desc}</p>
              {s.action && s.href && (
                <Link href={s.href}
                  className={`text-xs font-bold transition-colors
                    ${tab === "shipper" ? "text-orange-500 hover:text-orange-600" : "text-indigo-600 hover:text-indigo-700"}`}>
                  {s.action}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
//  FAQ
// ══════════════════════════════════════════
const FAQ_ITEMS = [
  {
    q: "수수료 4%는 누가 부담하나요?",
    a: "카 캐리어 기사에게만 부과됩니다. 화주(탁송 의뢰인)는 의뢰 등록부터 결제까지 추가 수수료 없습니다. 예: 50만 원 탁송 건 → 기사 정산 48만 원.",
  },
  {
    q: "차량 파손 시 책임은 누가 지나요?",
    a: "픽업·인도 시 기사가 차량 상태 리포트(사진 + 체크리스트)를 제출합니다. 탁송 전후 상태가 기록되므로 파손 책임 소재가 명확합니다. 분쟁 발생 시 탁카 운영팀이 중재에 참여합니다.",
  },
  {
    q: "카 캐리어 기사 자격은 어떻게 검증하나요?",
    a: "가입 시 카 캐리어 차량 등록증, 화물 운전면허, 사업자 정보를 제출합니다. 운영팀 수동 검토 후 승인됩니다. 불량 기사는 평점 시스템으로 자동 관리됩니다.",
  },
  {
    q: "매칭 후 취소하면 어떻게 되나요?",
    a: "화주 취소: 픽업 12시간 전까지 무료, 이후 요금의 10% 위약금. 기사 취소: 12시간 이내 20%, 당일 30% 패널티가 자동 부과되어 화주를 보호합니다.",
  },
  {
    q: "에스크로 정산은 언제 이루어지나요?",
    a: "화주가 인도 리포트 확인 후 정산 승인 시 즉시 정산됩니다. 미확인 시 인도 완료 72시간 후 자동 정산됩니다. 토스페이먼츠 에스크로로 안전하게 보관됩니다.",
  },
  {
    q: "전국 어디든 탁송이 가능한가요?",
    a: "서울·수도권·부산·대구·광주·대전·제주 등 전국 서비스 가능합니다. 제주 도서 지역은 별도 견적이 필요할 수 있습니다.",
  },
]

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block bg-gray-200 text-gray-600 text-xs font-bold
            px-3 py-1.5 rounded-full mb-4">
            자주 묻는 질문
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3">
            궁금한 점이 있으신가요?
          </h2>
          <p className="text-gray-400 text-sm">탁카 이용 전 가장 많이 묻는 질문들입니다</p>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={item.q} className={`border rounded-2xl overflow-hidden transition-colors
              ${open === i ? "border-orange-200 bg-orange-50/40" : "border-gray-100 bg-white"}`}>
              <button
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 min-h-[60px]">
                <span className="font-semibold text-gray-900 text-sm">{item.q}</span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  className={`shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-orange-100 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════
//  MOCK ORDERS (UI preview without auth)
// ══════════════════════════════════════════
const MOCK_ORDERS = [
  { origin: "서울 강남구", destination: "부산 해운대구", cargoType: "신차 3대", vehicleType: "8열 카 캐리어", price: "520,000원", urgent: false },
  { origin: "인천 남동구", destination: "대구 달서구", cargoType: "중고차 1대", vehicleType: "2열 카 캐리어", price: "180,000원", urgent: true },
  { origin: "경기 수원시", destination: "광주 서구", cargoType: "렌트카 4대", vehicleType: "4열 카 캐리어", price: "340,000원", urgent: false },
  { origin: "대전 유성구", destination: "제주도", cargoType: "경매 낙찰차 2대", vehicleType: "2열 카 캐리어", price: "610,000원", urgent: false },
]

// ══════════════════════════════════════════
//  TESTIMONIALS
// ══════════════════════════════════════════
const TESTIMONIALS = [
  {
    type: "shipper" as const,
    name: "김정훈",
    role: "딜러사 영업 매니저",
    location: "서울 강남",
    rating: 5,
    text: "처음엔 반신반의했는데 의뢰 올리고 35분 만에 기사님이 수락했습니다. 에스크로라 선입금 걱정도 없고, 픽업 전 상태 리포트까지 오니까 분쟁 여지가 없어졌어요.",
    highlight: "35분 만에 매칭",
  },
  {
    type: "driver" as const,
    name: "최민석",
    role: "카 캐리어 기사 9년차",
    location: "부산",
    rating: 5,
    text: "피드에서 내 경로에 맞는 건만 골라 수락하니까 공차 회송이 30% 이상 줄었습니다. 미수금 걱정도 에스크로로 해결됐고, 가입비 없이 시작할 수 있어서 부담이 없었어요.",
    highlight: "공차 회송 30% 감소",
  },
  {
    type: "shipper" as const,
    name: "이재현",
    role: "중고차 경매 법인 대표",
    location: "대구",
    rating: 5,
    text: "월 40건 탁송을 모두 탁카로 전환했습니다. 카카오 오픈채팅 관리하던 시간이 사라지고, 기사 검증도 플랫폼이 해주니까 훨씬 편합니다. 수수료도 기사 부담이라 비용 변화 없었어요.",
    highlight: "월 40건 전량 전환",
  },
  {
    type: "driver" as const,
    name: "장동훈",
    role: "카 캐리어 기사",
    location: "인천",
    rating: 5,
    text: "예전엔 화주한테 직접 돈 받다가 떼인 적도 있었는데, 탁카는 에스크로라 인도 완료하면 72시간 내 자동 정산됩니다. 수수료 4%면 이 안전함에 비해 충분히 납득 가능합니다.",
    highlight: "미수금 분쟁 0건",
  },
  {
    type: "shipper" as const,
    name: "박수연",
    role: "개인 화주",
    location: "경기 수원",
    rating: 5,
    text: "이사 때문에 차량 탁송이 처음이었는데 너무 쉬웠어요. 출발지·도착지·차종만 입력하고 기다리니까 기사님이 견적 주셨고, 차량 상태 리포트 사진도 받아서 안심이 됐습니다.",
    highlight: "첫 탁송도 문제 없음",
  },
]

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          className={i < n ? "text-amber-400" : "text-gray-200"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="currentColor"/>
        </svg>
      ))}
    </div>
  )
}

function TestimonialsSection() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block bg-orange-50 text-orange-600 text-xs font-bold
            px-3 py-1.5 rounded-full mb-4 border border-orange-100">
            실사용자 후기
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3">
            화주와 기사 모두 만족합니다
          </h2>
          <p className="text-gray-400 text-sm">실제 탁카 이용자의 경험입니다</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {TESTIMONIALS.slice(3).map((t, i) => (
            <TestimonialCard key={i + 3} {...t} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ type, name, role, location, rating, text, highlight }: typeof TESTIMONIALS[0]) {
  const isDriver = type === "driver"
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md
      hover:-translate-y-0.5 transition-all flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar initial */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-extrabold
            ${isDriver ? "bg-indigo-100 text-indigo-700" : "bg-orange-100 text-orange-700"}`}>
            {name[0]}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">{name}</div>
            <div className="text-[11px] text-gray-400">{role} · {location}</div>
          </div>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full
          ${isDriver ? "bg-indigo-50 text-indigo-600" : "bg-orange-50 text-orange-600"}`}>
          {isDriver ? "기사" : "화주"}
        </span>
      </div>

      <StarRating n={rating} />

      <p className="text-sm text-gray-600 leading-relaxed flex-1">{text}</p>

      <div className={`text-xs font-bold px-3 py-1.5 rounded-lg w-fit
        ${isDriver ? "bg-indigo-50 text-indigo-700" : "bg-orange-50 text-orange-700"}`}>
        ✓ {highlight}
      </div>
    </div>
  )
}
