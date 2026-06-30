export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-blue-500/10 pointer-events-none" />
        <span className="text-sm font-semibold tracking-widest text-orange-400 uppercase mb-4">
          K-Digital × Full-Stack Project
        </span>
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4">
          <span className="text-white">탁</span>
          <span className="text-orange-500">카</span>
        </h1>
        <p className="text-xl md:text-2xl text-zinc-400 max-w-xl mb-2">
          차량 탁송 의뢰인과 카 캐리어 기사를 실시간으로 연결하는
        </p>
        <p className="text-2xl md:text-3xl font-bold text-white mb-10">
          카 캐리어 중개 플랫폼
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {["Next.js 14", "TypeScript", "Supabase", "Tailwind CSS", "Leaflet"].map((t) => (
            <span
              key={t}
              className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-zinc-300"
            >
              {t}
            </span>
          ))}
        </div>
        <a
          href="https://github.com/manabout-town/takca"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-colors"
        >
          GitHub 보기 →
        </a>
      </section>

      {/* Overview */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <SectionLabel>프로젝트 개요</SectionLabel>
        <h2 className="text-4xl font-bold mb-6">
          운송을 더 쉽게, 연결을 더 빠르게
        </h2>
        <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl">
          탁카는 화주(배송 의뢰인)와 차주(운전기사)를 실시간으로 매칭하는 플랫폼입니다.
          화주는 탁송 의뢰를 등록하고 차주는 인근 의뢰를 확인해 수락합니다.
          실시간 채팅, 지도 기반 위치 추적, 에스크로 결제, 리뷰까지
          운송 전 과정을 플랫폼 내에서 처리합니다.
        </p>
      </section>

      {/* Features */}
      <section className="bg-zinc-900/50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>주요 기능</SectionLabel>
          <h2 className="text-4xl font-bold mb-12">두 역할, 하나의 플랫폼</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon="📦"
              title="화주 기능"
              items={[
                "차량 탁송 의뢰 등록 (지도 선택)",
                "실시간 기사 위치 추적",
                "에스크로 결제 — 완료 후 정산",
                "운행 완료 후 기사 리뷰 작성",
              ]}
            />
            <FeatureCard
              icon="🚚"
              title="카 캐리어 기사 기능"
              items={[
                "인근 탁송 의뢰 조회 및 지도 확인",
                "의뢰 수락 → 운행 시작 → 완료 처리",
                "실시간 위치 공유",
                "화주 채팅 / 운임 확인 / 정산 수령",
              ]}
            />
            <FeatureCard
              icon="🔒"
              title="인증 & 보안"
              items={[
                "SMS OTP 기반 전화번호 인증",
                "Supabase RLS 행 단위 보안",
                "역할 기반 라우트 분리",
                "에스크로 안전 결제",
              ]}
            />
            <FeatureCard
              icon="⚡"
              title="실시간 & 관리"
              items={[
                "실시간 알림 시스템",
                "관리자 대시보드 (/admin)",
                "신규 가입 온보딩 플로우",
                "차량 사진 + 노출 순위 관리",
              ]}
            />
          </div>
        </div>
      </section>

      {/* DB Schema */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <SectionLabel>데이터베이스</SectionLabel>
        <h2 className="text-4xl font-bold mb-10">8단계 마이그레이션</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: "001", name: "initial_schema", desc: "users, cargos, matches" },
            { num: "002", name: "wallet", desc: "지갑 / 잔액 관리" },
            { num: "003", name: "profile", desc: "프로필 확장" },
            { num: "004", name: "notifications", desc: "알림 시스템" },
            { num: "005", name: "phone_otp", desc: "전화번호 OTP 인증" },
            { num: "006", name: "driver_locations", desc: "실시간 위치 추적" },
            { num: "007", name: "completion_requested", desc: "완료 요청 상태" },
            { num: "008", name: "cargo_photos_rank", desc: "차량 사진 + 노출 순위" },
          ].map((m) => (
            <div
              key={m.num}
              className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-orange-500/50 transition-colors"
            >
              <span className="text-xs font-mono text-orange-400">{m.num}</span>
              <p className="font-semibold text-sm mt-1 mb-1">{m.name}</p>
              <p className="text-xs text-zinc-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-zinc-900/50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>기술 스택</SectionLabel>
          <h2 className="text-4xl font-bold mb-12">사용 기술</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { category: "Framework", items: ["Next.js 14 (App Router)", "TypeScript 5"] },
              { category: "Styling", items: ["Tailwind CSS 3", "Lucide React"] },
              { category: "Backend / DB", items: ["Supabase (PostgreSQL + RLS)", "Server Actions"] },
              { category: "지도 / 폼", items: ["React Leaflet + Leaflet.js", "React Hook Form + Zod"] },
            ].map((stack) => (
              <div
                key={stack.category}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">
                  {stack.category}
                </p>
                {stack.items.map((item) => (
                  <p key={item} className="text-zinc-300 text-sm py-1 border-b border-white/5 last:border-0">
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <SectionLabel>팀 소개</SectionLabel>
        <h2 className="text-4xl font-bold mb-12">함께 만든 사람들</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <TeamCard
            name="조정우"
            age="27세"
            role="Full-Stack Developer"
            school="동의대학교 응용소프트웨어학과"
            github="dhdhfkk1119"
            blog="velog.io/@dhdhfkk1119"
            tagline="초심을 잃지 않고 꾸준히 나아가는 개발자"
            skills={["Spring Boot", "Flutter", "Riverpod", "JPA", "MySQL"]}
            projects={["한숨(takeBreath) — 익명 고민 상담 플랫폼"]}
            highlights={[
              "사용자 정의 @Auth 어노테이션 설계",
              "Flutter Riverpod + IndexedStack 구조 설계",
              "Git/Jira 기반 협업 프로세스 구축",
            ]}
          />
          <TeamCard
            name="위희수"
            age="28세"
            role="Full-Stack Developer · 팀 리더"
            school="가야대학교"
            github=""
            blog=""
            tagline="도전을 경험으로 바꾸며 성장하는 개발자"
            skills={["Spring Boot", "Flutter", "MustacheJ", "JPA", "Spring AOP"]}
            projects={[
              "CHAKAK — 스냅 활동 거래 플랫폼",
              "한숨(takeBreath) — 익명 고민 상담 플랫폼",
            ]}
            highlights={[
              "CHAKAK 팀 리더 · Full-Stack 전담",
              "Spring AOP + ExceptionHandler 글로벌 처리",
              "Figma 기반 UI 설계 전담",
            ]}
          />
        </div>
      </section>

      {/* Education */}
      <section className="bg-zinc-900/50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>교육 이력</SectionLabel>
          <h2 className="text-4xl font-bold mb-10">K-Digital Training</h2>
          <div className="space-y-4">
            {[
              {
                period: "2025.09 ~ 2025.12",
                title: "[K-Digital] 생성형 AI 활용 Spring Boot 기반 웹개발과 Flutter 기반 앱개발 실무양성 심화과정",
                tags: ["Spring Boot", "Flutter", "AI", "심화"],
              },
              {
                period: "2025.04 ~ 2025.09",
                title: "[K-Digital] Java & Spring Boot 크로스 플랫폼(풀스택)융합 응용SW 개발자 양성 과정",
                tags: ["Java", "Spring Boot", "풀스택"],
              },
            ].map((edu) => (
              <div
                key={edu.title}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <span className="text-xs font-mono text-orange-400 whitespace-nowrap">{edu.period}</span>
                <p className="text-sm text-zinc-300 flex-1">{edu.title}</p>
                <div className="flex gap-2 flex-wrap">
                  {edu.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center text-zinc-600 text-sm">
        <p className="text-2xl font-black text-white mb-2">
          탁<span className="text-orange-500">카</span>
        </p>
        <p>탁카(Takca) — 2025</p>
        <a
          href="https://github.com/manabout-town/takca"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-orange-400 hover:text-orange-300 transition-colors"
        >
          github.com/manabout-town/takca
        </a>
      </footer>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest text-orange-400 uppercase mb-3">
      {children}
    </p>
  );
}

function FeatureCard({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-orange-500/30 transition-colors">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-zinc-400 flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">›</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeamCard({
  name, age, role, school, github, blog, tagline, skills, projects, highlights,
}: {
  name: string;
  age: string;
  role: string;
  school: string;
  github: string;
  blog: string;
  tagline: string;
  skills: string[];
  projects: string[];
  highlights: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-orange-500/40 transition-colors">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-xl font-black flex-shrink-0">
          {name[0]}
        </div>
        <div>
          <h3 className="text-xl font-bold">
            {name} <span className="text-sm font-normal text-zinc-500">({age})</span>
          </h3>
          <p className="text-orange-400 text-sm font-medium">{role}</p>
          <p className="text-zinc-500 text-xs mt-0.5">{school}</p>
        </div>
      </div>

      <p className="text-zinc-400 text-sm italic mb-6">"{tagline}"</p>

      <div className="mb-5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">기술 스택</p>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-zinc-300">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">프로젝트</p>
        {projects.map((p) => (
          <p key={p} className="text-sm text-zinc-400 flex items-start gap-2 mb-1">
            <span className="text-orange-500">›</span>{p}
          </p>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">주요 성과</p>
        {highlights.map((h) => (
          <p key={h} className="text-sm text-zinc-400 flex items-start gap-2 mb-1">
            <span className="text-orange-500">›</span>{h}
          </p>
        ))}
      </div>

      {github && (
        <a
          href={`https://github.com/${github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
        >
          GitHub: {github} →
        </a>
      )}
    </div>
  );
}
