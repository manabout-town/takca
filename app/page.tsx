"use server"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()
    
    if (profile?.role === "shipper") redirect("/shipper/dashboard")
    if (profile?.role === "driver") redirect("/driver/feed")
    if (profile?.role === "admin") redirect("/admin/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚛</span>
          <span className="text-white text-xl font-bold">화물로</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="text-white/80 hover:text-white px-4 py-2 text-sm">
            로그인
          </Link>
          <Link href="/signup" className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50">
            시작하기
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-2 rounded-full text-sm mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          카카오 오픈채팅을 넘어서는 정식 화물 중개 플랫폼
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          화물 운송,<br/>
          <span className="text-yellow-400">더 쉽고 안전하게</span>
        </h1>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          화주와 기사를 직접 연결합니다. 에스크로 안전결제로 믿을 수 있고,
          실시간 채팅으로 소통이 편리합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup?role=shipper"
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold transition-colors">
            화주로 시작하기 →
          </Link>
          <Link href="/signup?role=driver"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl text-lg font-semibold transition-colors">
            기사로 시작하기
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "🔒", title: "에스크로 안전결제", desc: "결제금을 플랫폼이 보관 후, 운송 완료 시 기사에게 지급합니다." },
            { icon: "⚡", title: "긴급 부스팅", desc: "1,000원으로 내 의뢰를 피드 상단에 노출시켜 빠른 매칭을 받으세요." },
            { icon: "💬", title: "실시간 채팅", desc: "매칭 즉시 1:1 채팅방이 열립니다. 운송 세부사항을 직접 조율하세요." },
          ].map((f) => (
            <div key={f.title} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-white">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-blue-100 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { num: "3~5%", label: "거래 수수료" },
            { num: "72h", label: "자동 에스크로 해제" },
            { num: "0원", label: "의뢰 등록 수수료" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold text-yellow-400 mb-2">{s.num}</div>
              <div className="text-blue-200 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/10 text-center text-blue-200 text-sm">
        <p>© 2024 화물로. 모든 거래는 에스크로로 보호됩니다.</p>
      </footer>
    </div>
  )
}
