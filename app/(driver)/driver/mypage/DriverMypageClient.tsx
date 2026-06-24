"use client"
import { useState, useTransition, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { DriverRankBadge, RankCard, AllRanksTable } from "@/components/shared/DriverRankBadge"
import {
  updateBasicInfo,
  updatePassword,
  updateVehicle,
  updateAvatarUrl,
  updateLicenseDocUrl,
} from "@/app/actions/profile"
import { signOut } from "@/app/actions/auth"
import { formatKRW, formatDate, formatDateOnly } from "@/lib/utils/format"
import { MATCH_STATUS_LABEL } from "@/lib/utils/status"
import type { KYCStatus } from "@/lib/types"
import Link from "next/link"

const REGIONS = [
  "서울","경기","인천","강원","충북","충남","대전","세종",
  "전북","전남","광주","경북","경남","대구","울산","부산","제주",
]
const VEHICLE_TYPES = [
  "다마스/라보","1톤","1.4톤","2.5톤","3.5톤","5톤","11톤","18톤","25톤",
  "윙바디","냉동/냉장","특수차량",
]

type Tab = "profile" | "matches" | "payouts" | "schedule" | "edit" | "security"

interface Props {
  profile: any
  dp: any
  matches: any[]
  completedMatches: any[]
  reviews: any[]
  totalEarned: number
  pendingPayouts: any[]
  paidPayouts: any[]
  pendingAmount: number
  totalPaid: number
  userId: string
}

function Feedback({ msg, isError }: { msg: string; isError?: boolean }) {
  return (
    <div
      className={`text-sm px-4 py-2.5 rounded-xl ${
        isError
          ? "bg-red-50 text-red-600 border border-red-100"
          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
      }`}
    >
      {isError ? "⚠ " : "✓ "}
      {msg}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-gray-900 text-sm mb-4">{children}</h3>
}

function InputField({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent bg-white"
      />
    </div>
  )
}

function KycBadge({ status }: { status: KYCStatus | string }) {
  const map: Record<string, { label: string; cls: string }> = {
    verified:   { label: "인증 완료", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    pending:    { label: "심사 중",   cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    unverified: { label: "미인증",    cls: "bg-gray-100 text-gray-500 border-gray-200" },
    rejected:   { label: "반려됨",    cls: "bg-red-100 text-red-600 border-red-200" },
  }
  const cfg = map[status] ?? map.unverified
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  )
}

const MATCH_STATUS_COLOR: Record<string, string> = {
  accepted:    "bg-blue-100 text-blue-700",
  in_progress: "bg-[#FF6B2B]/10 text-[#FF6B2B]",
  completed:   "bg-emerald-100 text-emerald-700",
  cancelled:   "bg-gray-100 text-gray-500",
}

const TABS: { id: Tab; label: string }[] = [
  { id: "profile",  label: "내 정보" },
  { id: "matches",  label: "수락 내역" },
  { id: "payouts",  label: "정산 내역" },
  { id: "schedule", label: "스케줄" },
  { id: "edit",     label: "정보 수정" },
  { id: "security", label: "보안" },
]

// Simple calendar helper
function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

function ScheduleCalendar({ matches }: { matches: any[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const upcomingMatches = matches.filter((m) => {
    const order = m.orders as any
    if (!order?.pickup_at) return false
    return ["accepted", "in_progress"].includes(m.status)
  })

  // Build a set of days that have pickups this month
  const pickupDays = new Set<number>()
  upcomingMatches.forEach((m) => {
    const order = m.orders as any
    if (!order?.pickup_at) return
    const d = new Date(order.pickup_at)
    if (d.getFullYear() === year && d.getMonth() === month) {
      pickupDays.add(d.getDate())
    }
  })

  const grid = getMonthGrid(year, month)
  const monthLabel = new Date(year, month, 1).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  })

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // Selected day details
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const selectedMatches = selectedDay
    ? upcomingMatches.filter((m) => {
        const order = m.orders as any
        if (!order?.pickup_at) return false
        const d = new Date(order.pickup_at)
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay
      })
    : []

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ‹
          </button>
          <span className="font-semibold text-gray-900 text-sm">{monthLabel}</span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {["일","월","화","수","목","금","토"].map((d, i) => (
            <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {grid.map((day, i) => {
            if (day === null) return <div key={`null-${i}`} />
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear()
            const hasPickup = pickupDays.has(day)
            const isSelected = selectedDay === day
            const col = i % 7
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative flex flex-col items-center justify-center h-9 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-[#FF6B2B] text-white"
                    : isToday
                    ? "bg-[#FF6B2B]/10 text-[#FF6B2B] font-bold"
                    : "hover:bg-gray-50 text-gray-700"
                } ${col === 0 ? "text-red-400" : col === 6 ? "text-blue-400" : ""} ${
                  isSelected ? "!text-white" : ""
                }`}
              >
                {day}
                {hasPickup && (
                  <span
                    className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                      isSelected ? "bg-white" : "bg-[#FF6B2B]"
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            {year}년 {month + 1}월 {selectedDay}일 일정
          </p>
          {selectedMatches.length === 0 ? (
            <p className="text-sm text-gray-400">이 날 예정된 픽업이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {selectedMatches.map((m) => {
                const order = m.orders as any
                return (
                  <Link
                    key={m.id}
                    href={`/driver/orders/${order?.id || m.order_id}`}
                    className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3 hover:bg-orange-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order?.origin} → {order?.destination}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        픽업: {order?.pickup_at ? formatDate(order.pickup_at) : "-"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        MATCH_STATUS_COLOR[m.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {MATCH_STATUS_LABEL[m.status as keyof typeof MATCH_STATUS_LABEL] ?? m.status}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Upcoming jobs list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="font-semibold text-gray-900 text-sm">다가오는 운송 ({upcomingMatches.length}건)</p>
        </div>
        {upcomingMatches.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            수락된 운송이 없습니다
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcomingMatches.map((m) => {
              const order = m.orders as any
              return (
                <Link
                  key={m.id}
                  href={`/driver/orders/${order?.id || m.order_id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order?.origin} → {order?.destination}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      픽업: {order?.pickup_at ? formatDateOnly(order.pickup_at) : "-"}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-[#FF6B2B]">
                      {order?.price ? formatKRW(order.price) : "-"}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        MATCH_STATUS_COLOR[m.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {MATCH_STATUS_LABEL[m.status as keyof typeof MATCH_STATUS_LABEL] ?? m.status}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export function DriverMypageClient({
  profile,
  dp,
  matches,
  completedMatches,
  reviews,
  totalEarned,
  pendingPayouts,
  paidPayouts,
  pendingAmount,
  totalPaid,
  userId,
}: Props) {
  const [tab, setTab] = useState<Tab>("profile")
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ msg: string; isError: boolean } | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [docUploading, setDocUploading] = useState(false)
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(dp?.route_regions || [])
  const [showAllRanks, setShowAllRanks] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const completedCount = completedMatches.length

  function showFeedback(msg: string, isError = false) {
    setFeedback({ msg, isError })
    setTimeout(() => setFeedback(null), 4000)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showFeedback("5MB 이하 이미지만 업로드 가능합니다", true)
      return
    }
    setAvatarUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (error) {
      showFeedback(error.message, true)
      setAvatarUploading(false)
      return
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path)
    const result = await updateAvatarUrl(publicUrl)
    if (result?.error) {
      showFeedback(result.error, true)
    } else {
      setAvatarUrl(publicUrl + "?t=" + Date.now())
      showFeedback("프로필 사진이 업데이트되었습니다")
    }
    setAvatarUploading(false)
  }

  async function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      showFeedback("10MB 이하 파일만 업로드 가능합니다", true)
      return
    }
    setDocUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${userId}/license.${ext}`
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true })
    if (error) {
      showFeedback(error.message, true)
      setDocUploading(false)
      return
    }
    const result = await updateLicenseDocUrl(path)
    if (result?.error) {
      showFeedback(result.error, true)
    } else {
      showFeedback("서류가 업로드되었습니다")
    }
    setDocUploading(false)
  }

  function handleFormAction(
    action: (fd: FormData) => Promise<{ error?: string; success?: boolean } | void>
  ) {
    return (formData: FormData) => {
      startTransition(async () => {
        const result = await action(formData)
        if (result?.error) showFeedback(result.error, true)
        else if (result?.success) showFeedback("저장되었습니다")
      })
    }
  }

  const inProgressCount = matches.filter((m) => ["accepted", "in_progress"].includes(m.status)).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">마이페이지</h1>
          <p className="text-sm md:text-base text-gray-400 mt-2">프로필 및 계정 관리</p>
        </div>
        <span className="text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full font-semibold border border-indigo-100 sm:mt-1 self-start">
          기사
        </span>
      </div>

      {/* Profile summary card */}
      <div className="bg-gray-950 rounded-2xl p-4 md:p-6 text-white flex items-center gap-3 md:gap-5">
        <button
          onClick={() => avatarInputRef.current?.click()}
          className="relative shrink-0 group min-w-[60px] min-h-[60px]"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                {profile?.name?.[0]}
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-white">{avatarUploading ? "업로드 중" : "변경"}</span>
          </div>
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <div className="flex-1 min-w-0">
          <p className="font-bold text-base md:text-lg leading-tight truncate">
            {profile?.nickname ? `"${profile.nickname}" ` : ""}
            {profile?.name}
          </p>
          <p className="text-gray-400 text-xs md:text-sm truncate">{profile?.email}</p>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <DriverRankBadge completedCount={completedCount} size="sm" showProgress={false} />
            {dp?.rating_avg > 0 && (
              <span className="text-xs text-amber-400 font-semibold">
                ★ {dp.rating_avg.toFixed(1)}
              </span>
            )}
            <KycBadge status={profile?.verification_status || "unverified"} />
          </div>
        </div>
        <Link href="/driver/wallet" className="shrink-0 text-center min-h-[44px] flex flex-col justify-center">
          <p className="text-xs text-gray-400">수익 지갑</p>
          <p className="font-bold text-emerald-400 text-base md:text-lg">{formatKRW(totalEarned)}</p>
        </Link>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2.5 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                tab === t.id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {feedback && <Feedback msg={feedback.msg} isError={feedback.isError} />}

      {/* ── Tab: 내 정보 ── */}
      {tab === "profile" && (
        <div className="space-y-4">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <SectionTitle>기본 정보</SectionTitle>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "이름",    value: profile?.name },
                { label: "이메일",  value: profile?.email },
                { label: "전화번호", value: profile?.phone || "미등록" },
                { label: "차량번호", value: dp?.vehicle_number || "미등록" },
                { label: "차량 종류", value: dp?.vehicle_type || "미등록" },
                { label: "홈 지역",  value: dp?.home_region || "미설정" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-medium text-gray-900 truncate">{value}</p>
                </div>
              ))}
            </div>
            <div className="pt-1 flex items-center gap-3 flex-wrap">
              <div>
                <p className="text-xs text-gray-400 mb-1">KYC 인증</p>
                <KycBadge status={profile?.verification_status || "unverified"} />
              </div>
              {dp?.rating_avg > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">평점</p>
                  <p className="text-sm font-semibold text-amber-500">
                    ★ {dp.rating_avg.toFixed(1)}
                    <span className="text-xs text-gray-400 font-normal ml-1">
                      ({dp.rating_count || 0}건)
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <RankCard completedCount={completedCount} />

          <button
            onClick={() => setShowAllRanks((s) => !s)}
            className="w-full py-2.5 text-sm text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            {showAllRanks ? "등급표 닫기" : "전체 등급표 보기 →"}
          </button>

          {showAllRanks && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <SectionTitle>등급 시스템</SectionTitle>
              <AllRanksTable completedCount={completedCount} />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              { label: "총 운송",   value: `${matches.length}건` },
              { label: "완료",      value: `${completedCount}건` },
              { label: "진행 중",   value: `${inProgressCount}건` },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 text-center">
                <p className="font-bold text-base md:text-lg text-emerald-700">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>받은 리뷰</SectionTitle>
              <div className="space-y-3">
                {reviews.slice(0, 5).map((r: any) => (
                  <div key={r.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={i <= r.rating ? "text-amber-400" : "text-gray-200"}>
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-gray-400 ml-2">{formatDate(r.created_at)}</span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: 수락 내역 ── */}
      {tab === "matches" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "전체",   value: matches.length,                                    color: "text-gray-900" },
              { label: "진행중", value: inProgressCount,                                    color: "text-[#FF6B2B]" },
              { label: "완료",   value: completedCount,                                    color: "text-emerald-600" },
              { label: "취소",   value: matches.filter(m => m.status === "cancelled").length, color: "text-gray-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {matches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-4xl mb-3">🚚</p>
              <p className="font-semibold text-gray-700">수락한 의뢰가 없습니다</p>
              <Link
                href="/driver/feed"
                className="inline-block mt-4 px-5 py-2.5 bg-[#FF6B2B] text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
              >
                의뢰 피드 보러가기
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {matches.map((m: any) => {
                  const order = m.orders as any
                  return (
                    <Link
                      key={m.id}
                      href={`/driver/orders/${order?.id || m.order_id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              MATCH_STATUS_COLOR[m.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {MATCH_STATUS_LABEL[m.status as keyof typeof MATCH_STATUS_LABEL] ?? m.status}
                          </span>
                          {order?.is_urgent && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                              긴급
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {order?.origin} → {order?.destination}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          화주: {order?.shippers?.name || "알 수 없음"} ·{" "}
                          {m.matched_at ? formatDate(m.matched_at) : "-"}
                        </p>
                      </div>
                      <p className="font-semibold text-[#FF6B2B] text-sm shrink-0 ml-3">
                        {order?.price ? formatKRW(order.price) : "-"}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: 정산 내역 ── */}
      {tab === "payouts" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-xl font-bold text-[#FF6B2B]">{formatKRW(pendingAmount)}</p>
              <p className="text-xs text-gray-500 mt-1">정산 대기</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-xl font-bold text-emerald-600">{formatKRW(totalPaid)}</p>
              <p className="text-xs text-gray-500 mt-1">수령 완료</p>
            </div>
          </div>

          {/* Pending payouts */}
          {pendingPayouts.length > 0 && (
            <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B2B] animate-pulse" />
                <h2 className="font-semibold text-gray-900 text-sm">
                  정산 대기 ({pendingPayouts.length}건)
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {pendingPayouts.map((p: any) => {
                  const order = p.escrow?.orders
                  return (
                    <div key={p.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {order?.origin} → {order?.destination}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order?.pickup_at ? formatDateOnly(order.pickup_at) : "-"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm">{formatKRW(p.amount)}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-orange-100 text-orange-700">
                          대기
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Paid payouts */}
          {paidPayouts.length === 0 && pendingPayouts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-4xl mb-3">💰</p>
              <p className="font-semibold text-gray-700">정산 내역이 없습니다</p>
              <p className="text-xs text-gray-400 mt-1">완료된 운송 후 정산 내역이 표시됩니다</p>
            </div>
          ) : paidPayouts.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-semibold text-gray-900 text-sm">수령 완료 내역</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {paidPayouts.map((p: any) => {
                  const order = p.escrow?.orders
                  return (
                    <div key={p.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {order?.origin} → {order?.destination}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.paid_at ? formatDate(p.paid_at) : "-"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 text-sm">{formatKRW(p.amount)}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                          수령
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="text-center">
            <Link
              href="/driver/wallet"
              className="inline-flex items-center gap-1.5 text-sm text-[#FF6B2B] font-semibold hover:underline"
            >
              전체 지갑 내역 보기 →
            </Link>
          </div>
        </div>
      )}

      {/* ── Tab: 스케줄 ── */}
      {tab === "schedule" && <ScheduleCalendar matches={matches} />}

      {/* ── Tab: 정보 수정 ── */}
      {tab === "edit" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6">
            {/* Avatar */}
            <div>
              <SectionTitle>프로필 사진</SectionTitle>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-300">
                      {profile?.name?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="px-4 py-2 bg-[#FF6B2B] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {avatarUploading ? "업로드 중..." : "사진 변경"}
                  </button>
                  <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, WEBP · 최대 5MB</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-50" />

            {/* Basic info */}
            <div>
              <SectionTitle>기본 정보</SectionTitle>
              <form action={handleFormAction(updateBasicInfo)} className="space-y-3">
                <InputField label="이름" name="name" defaultValue={profile?.name} required />
                <InputField label="별명 (닉네임)" name="nickname" defaultValue={profile?.nickname} placeholder="예: 빠른배송왕" />
                <InputField label="휴대폰 번호" name="phone" type="tel" defaultValue={profile?.phone} placeholder="01012345678" />
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 bg-[#FF6B2B] hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isPending ? "저장 중..." : "정보 저장"}
                </button>
              </form>
            </div>
          </div>

          {/* Vehicle info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <SectionTitle>차량 정보</SectionTitle>
            <form action={handleFormAction(updateVehicle)} className="space-y-3">
              <InputField label="차량번호" name="vehicleNumber" defaultValue={dp?.vehicle_number} placeholder="예: 12가3456" required />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  차량 종류<span className="text-red-400 ml-0.5">*</span>
                </label>
                <select
                  name="vehicleType"
                  defaultValue={dp?.vehicle_type}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent bg-white"
                >
                  <option value="">선택</option>
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">거주지 (홈 지역)</label>
                <select
                  name="homeRegion"
                  defaultValue={dp?.home_region || ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent bg-white"
                >
                  <option value="">미설정</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">운송 루트 (복수 선택)</label>
                <input type="hidden" name="routeRegions" value={selectedRoutes.join(",")} />
                <div className="flex flex-wrap gap-1.5">
                  {REGIONS.map((r) => {
                    const active = selectedRoutes.includes(r)
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() =>
                          setSelectedRoutes((prev) =>
                            active ? prev.filter((x) => x !== r) : [...prev, r]
                          )
                        }
                        className={`px-3 py-2 min-h-[40px] rounded-full text-xs font-medium border transition-all ${
                          active
                            ? "bg-[#FF6B2B] text-white border-[#FF6B2B]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#FF6B2B]"
                        }`}
                      >
                        {r}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-[#FF6B2B] hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {isPending ? "저장 중..." : "차량 정보 저장"}
              </button>
            </form>
          </div>

          {/* License doc */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <SectionTitle>운전 자격 서류</SectionTitle>
            <p className="text-xs text-gray-400 mb-4">
              사업자등록증, 화물운송종사자격증 등을 업로드하세요
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => docInputRef.current?.click()}
                disabled={docUploading}
                className="px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-[#FF6B2B] text-gray-600 hover:text-[#FF6B2B] text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {docUploading ? "업로드 중..." : dp?.license_doc_url ? "서류 재업로드" : "서류 업로드"}
              </button>
              {dp?.license_doc_url && (
                <span className="text-xs text-emerald-600 font-semibold">✓ 서류 등록됨</span>
              )}
            </div>
            <input
              ref={docInputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={handleDocChange}
            />
            <p className="text-xs text-gray-400 mt-2">JPG, PNG, PDF · 최대 10MB · 관리자 검토 후 인증 처리</p>
          </div>
        </div>
      )}

      {/* ── Tab: 보안 ── */}
      {tab === "security" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6">
          <div>
            <SectionTitle>계정 정보</SectionTitle>
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
              <span className="text-gray-400 text-xs">이메일 (변경 불가)</span>
              <p className="font-medium mt-0.5">{profile?.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          <div>
            <SectionTitle>비밀번호 변경</SectionTitle>
            <form action={handleFormAction(updatePassword)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  새 비밀번호<span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  placeholder="8자 이상, 특수문자 포함"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  새 비밀번호 확인<span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="비밀번호 재입력"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-400">8자 이상, 특수문자(!@#$% 등) 1개 이상 포함</p>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-[#FF6B2B] hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {isPending ? "변경 중..." : "비밀번호 변경"}
              </button>
            </form>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-500 mb-3">계정</p>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
