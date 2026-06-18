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
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-[60px]">

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
            실시간 운영 중 · 전국 화물 중개 플랫폼
          </div>

          <h1 className="text-5xl md:text-[4.5rem] lg:text-[5.5rem] font-extrabold text-white
            tracking-tight mb-5 leading-[1.06]">
            화물 운송,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
              직접 연결.
            </span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-lg mx-auto mb-4 leading-relaxed">
            화주와 기사를 중간 없이 잇는 화물 중개 플랫폼.<br />
            에스크로 안전결제로 양쪽 모두 보호합니다.
          </p>

          {/* ── 나는 누구인가요? 즉시 선택 ── */}
          <p className="text-xs text-gray-500 mb-4 font-medium">나는 누구인가요?</p>
          <RoleSelector />

          {/* Mini trust strip */}
          <div className="flex items-center justify-center gap-6 mt-10 text-[11px] text-gray-600">
            {[
              "✓ 가입비 없음",
              "✓ 의뢰 등록 무료",
              "✓ 에스크로 안전결제",
              "✓ 평균 47분 매칭",
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
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "94.7%", label: "매칭 성공률", sub: "전국 기사 네트워크" },
            { num: "47분", label: "평균 매칭 시간", sub: "긴급 건 3분 이내" },
            { num: "4.8점", label: "기사 평균 평점", sub: "5점 만점" },
            { num: "4%", label: "기사 수수료", sub: "화주 등록 무료" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 tabular-nums">{s.num}</div>
              <div className="text-sm font-semibold text-gray-700 mb-0.5">{s.label}</div>
              <div className="text-xs text-gray-400">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ABOUT — 서비스가 뭔지 한눈에
      ══════════════════════════════════════════ */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              화물로란?
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              두 타입의 사용자를 위한 플랫폼
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto text-sm">
              화주는 의뢰를 올리고, 기사는 원하는 건을 골라 수락합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">

            {/* 화주 카드 */}
            <div className="relative bg-white rounded-3xl border border-orange-100 p-8 overflow-hidden
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
                  화주 (보내는 사람)
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                  화물을 보내야 한다면
                </h3>
                <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                  의뢰만 올리면 전국 검증 기사님이 직접 연락합니다.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    { n: "01", text: "무료 의뢰 등록 — 출발지·도착지·화물 종류·희망 금액" },
                    { n: "02", text: "기사님 매칭 알림 수신 (평균 47분, 긴급은 3분)" },
                    { n: "03", text: "에스크로 안전결제 후 운송 시작" },
                    { n: "04", text: "완료 후 평가 — 다음 거래가 더 빠릅니다" },
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
                  text-white px-6 py-3 rounded-xl font-bold text-sm transition-all
                  hover:shadow-lg hover:shadow-orange-500/25">
                  화주로 무료 가입 →
                </Link>
              </div>
            </div>

            {/* 기사 카드 */}
            <div className="relative bg-white rounded-3xl border border-indigo-100 p-8 overflow-hidden
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
                  기사 (운송하는 사람)
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                  화물을 운송하고 싶다면
                </h3>
                <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                  피드에서 원하는 건만 골라 수락. 강요 없이 자유롭게.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    { n: "01", text: "가입 — 차량 정보 등록 (가입비 0원)" },
                    { n: "02", text: "실시간 의뢰 피드에서 원하는 건 선택" },
                    { n: "03", text: "화주와 1:1 채팅으로 픽업 일정 조율" },
                    { n: "04", text: "운송 완료 후 에스크로 정산 (수수료 4%)" },
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
                  text-white px-6 py-3 rounded-xl font-bold text-sm transition-all
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
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              안심하고 거래할 수 있는 이유
            </h2>
            <p className="text-gray-500 text-sm">6가지 핵심 기능으로 화주와 기사 모두를 보호합니다</p>
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
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
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
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">지금 이 순간도</h2>
            <p className="text-gray-400 text-sm">전국에서 의뢰가 올라오고 있습니다</p>
          </div>

          {/* Mock order cards (실제 데이터는 로그인 후 확인) */}
          <div className="space-y-3 mb-6">
            {MOCK_ORDERS.map((o, i) => (
              <div key={i}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
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
              전체 의뢰를 확인하고 매칭을 받으려면 로그인하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3
                rounded-xl text-sm font-bold transition-colors">
                로그인하고 전체 보기 →
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
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="bg-gray-950 py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-block bg-white/5 border border-white/10 text-gray-400
            text-xs font-bold px-3 py-1.5 rounded-full mb-6">
            지금 시작하세요
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
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
              화주로 시작하기
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
              기사로 시작하기
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
            <span className="text-white font-bold text-sm">화물로</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/intro" className="hover:text-white transition-colors">서비스 소개</Link>
            <a href="#" className="hover:text-white transition-colors">이용약관</a>
            <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
          </div>
          <div className="text-xs text-gray-700">© 2025 화물로</div>
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
    <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
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
    icon: <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>,
    title: "에스크로 안전결제",
    desc: "결제금을 제3자가 보관, 운송 완료 후 자동 정산. 사기 불가.",
    tag: "화주·기사 모두",
  },
  {
    color: "text-amber-400", bg: "bg-amber-400/10", borderHover: "hover:border-amber-200",
    icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none"/>,
    title: "긴급 부스팅",
    desc: "1,000원으로 피드 최상단 노출. 평균 3분 내 매칭.",
    tag: "화주 전용",
  },
  {
    color: "text-blue-400", bg: "bg-blue-400/10", borderHover: "hover:border-blue-200",
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>,
    title: "실시간 채팅",
    desc: "매칭 즉시 1:1 채팅방 개설. 모든 소통 한 곳에서.",
    tag: "화주·기사 모두",
  },
  {
    color: "text-emerald-400", bg: "bg-emerald-400/10", borderHover: "hover:border-emerald-200",
    icon: (
      <>
        <rect x="1" y="3" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </>
    ),
    title: "차량 맞춤 매칭",
    desc: "화물 종류와 무게에 맞는 최적 차량 자동 필터링.",
    tag: "화주 전용",
  },
  {
    color: "text-purple-400", bg: "bg-purple-400/10", borderHover: "hover:border-purple-200",
    icon: (
      <>
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </>
    ),
    title: "경로 시각화",
    desc: "출발·도착지를 지도로 한눈에 확인.",
    tag: "화주·기사 모두",
  },
  {
    color: "text-yellow-400", bg: "bg-yellow-400/10", borderHover: "hover:border-yellow-200",
    icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>,
    title: "상호 평가",
    desc: "완료 후 화주·기사 양쪽 평가. 신뢰 기반 거래.",
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
    { icon: "📝", title: "의뢰 등록", desc: "출발지·도착지·화물 종류·희망 금액 입력 후 등록. 5분이면 충분.", action: "의뢰 등록하기 →", href: "/signup?role=shipper" },
    { icon: "🔔", title: "기사 매칭 알림", desc: "검증된 기사님들이 의뢰를 보고 직접 제안합니다. 평균 47분.", action: null, href: null },
    { icon: "💳", title: "에스크로 결제", desc: "결제금이 제3자에게 안전 보관됩니다. 운송 완료 전엔 기사에게 지급되지 않습니다.", action: null, href: null },
    { icon: "✅", title: "완료 & 평가", desc: "운송 완료 확인 후 에스크로 정산. 기사 평점을 남겨주세요.", action: "지금 시작하기 →", href: "/signup?role=shipper" },
  ],
  driver: [
    { icon: "🚚", title: "차량 정보 등록", desc: "가입 후 차량 종류와 허용 적재 무게를 등록합니다. 가입비 없음.", action: "기사 가입하기 →", href: "/signup?role=driver" },
    { icon: "📋", title: "의뢰 피드 확인", desc: "실시간으로 올라오는 의뢰 중 내 차량과 경로에 맞는 건을 선택합니다.", action: null, href: null },
    { icon: "💬", title: "화주와 채팅 조율", desc: "1:1 채팅으로 픽업 시간과 세부 사항을 빠르게 조율합니다.", action: null, href: null },
    { icon: "💰", title: "에스크로 정산", desc: "운송 완료 후 자동 정산. 수수료 4%만 차감 후 즉시 입금.", action: "지금 시작하기 →", href: "/signup?role=driver" },
  ],
}

function HowItWorksTabs() {
  const [tab, setTab] = useState<"shipper" | "driver">("shipper")
  const steps = HOW_STEPS[tab]

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 justify-center mb-10">
        <button
          onClick={() => setTab("shipper")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
            ${tab === "shipper"
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          화주 (보내는 사람)
        </button>
        <button
          onClick={() => setTab("driver")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
            ${tab === "driver"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="1" y="3" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
            <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
          </svg>
          기사 (운송하는 사람)
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
//  MOCK ORDERS (UI preview without auth)
// ══════════════════════════════════════════
const MOCK_ORDERS = [
  { origin: "서울 강남구", destination: "부산 해운대구", cargoType: "가전제품", vehicleType: "5톤 트럭", price: "320,000원", urgent: false },
  { origin: "인천 남동구", destination: "대구 달서구", cargoType: "건자재", vehicleType: "1톤 트럭", price: "180,000원", urgent: true },
  { origin: "경기 수원시", destination: "광주 서구", cargoType: "의류", vehicleType: "2.5톤 트럭", price: "240,000원", urgent: false },
  { origin: "대전 유성구", destination: "울산 남구", cargoType: "식자재", vehicleType: "냉동차", price: "410,000원", urgent: false },
]
