export const DRIVER_RANKS = [
  { level: 1, title: "새내기",    emoji: "🌱", bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-200",   min: 0   },
  { level: 2, title: "견습 기사", emoji: "🚗", bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  min: 5   },
  { level: 3, title: "숙련 기사", emoji: "🚐", bg: "bg-teal-100",   text: "text-teal-700",   border: "border-teal-200",   min: 15  },
  { level: 4, title: "전문 기사", emoji: "🚛", bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", min: 30  },
  { level: 5, title: "고수 기사", emoji: "⭐", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", min: 50  },
  { level: 6, title: "베테랑",    emoji: "🏆", bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", min: 100 },
  { level: 7, title: "마스터",    emoji: "💎", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", min: 200 },
  { level: 8, title: "레전드",    emoji: "👑", bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-200",  min: 500 },
] as const

export function getDriverRank(completedCount: number): (typeof DRIVER_RANKS)[number] {
  let rank: (typeof DRIVER_RANKS)[number] = DRIVER_RANKS[0]
  for (const r of DRIVER_RANKS) {
    if (completedCount >= r.min) rank = r
  }
  return rank
}

interface Props {
  completedCount: number
  size?: "sm" | "md" | "lg"
  showProgress?: boolean
}

export function DriverRankBadge({ completedCount, size = "md", showProgress = true }: Props) {
  const rank = getDriverRank(completedCount)
  const nextRank = DRIVER_RANKS.find(r => r.level === rank.level + 1)

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  }

  const progress = nextRank
    ? Math.min(100, ((completedCount - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100

  return (
    <div className="inline-flex flex-col gap-2">
      <span className={`inline-flex items-center font-semibold rounded-full border ${rank.bg} ${rank.text} ${rank.border} ${sizeClasses[size]}`}>
        <span>{rank.emoji}</span>
        <span>Lv.{rank.level} {rank.title}</span>
      </span>

      {showProgress && (
        <div className="min-w-[160px]">
          {nextRank ? (
            <>
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>다음: {nextRank.emoji} {nextRank.title}</span>
                <span>{completedCount} / {nextRank.min}건</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-[10px] text-amber-600 font-semibold">🎉 최고 등급 달성!</p>
          )}
        </div>
      )}
    </div>
  )
}

export function RankCard({ completedCount }: { completedCount: number }) {
  const rank = getDriverRank(completedCount)
  const nextRank = DRIVER_RANKS.find(r => r.level === rank.level + 1)
  const progress = nextRank
    ? Math.min(100, ((completedCount - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100

  return (
    <div className={`rounded-2xl border p-5 ${rank.bg} ${rank.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">현재 등급</p>
          <p className={`text-2xl font-bold ${rank.text}`}>{rank.emoji} Lv.{rank.level} {rank.title}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">완료 운송</p>
          <p className={`text-xl font-bold ${rank.text}`}>{completedCount}건</p>
        </div>
      </div>
      {nextRank ? (
        <>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>다음 등급까지</span>
            <span>{nextRank.min - completedCount}건 남음</span>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">다음 단계: {nextRank.emoji} {nextRank.title} ({nextRank.min}건)</p>
        </>
      ) : (
        <p className="text-sm font-semibold text-amber-700">🎉 최고 등급입니다!</p>
      )}
    </div>
  )
}

export function AllRanksTable({ completedCount }: { completedCount: number }) {
  const currentRank = getDriverRank(completedCount)
  return (
    <div className="space-y-1.5">
      {DRIVER_RANKS.map(r => {
        const isCurrentOrPast = completedCount >= r.min
        const isCurrent = r.level === currentRank.level
        return (
          <div key={r.level} className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
            isCurrent ? `${r.bg} ${r.border} shadow-sm` : isCurrentOrPast ? "bg-gray-50 border-gray-100" : "border-gray-50 opacity-50"
          }`}>
            <span className="text-lg w-7 text-center">{r.emoji}</span>
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-semibold ${isCurrent ? r.text : "text-gray-600"}`}>
                Lv.{r.level} {r.title}
              </span>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{r.min}건 이상</span>
            {isCurrent && <span className="text-xs font-bold text-indigo-600 shrink-0">현재</span>}
            {!isCurrent && isCurrentOrPast && <span className="text-xs text-emerald-500 shrink-0">✓</span>}
          </div>
        )
      })}
    </div>
  )
}
