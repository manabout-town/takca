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
import { formatKRW, formatDate } from "@/lib/utils/format"
import Link from "next/link"

const REGIONS = ["서울", "경기", "인천", "강원", "충북", "충남", "대전", "세종", "전북", "전남", "광주", "경북", "경남", "대구", "울산", "부산", "제주"]
const VEHICLE_TYPES = ["다마스/라보", "1톤", "1.4톤", "2.5톤", "3.5톤", "5톤", "11톤", "18톤", "25톤", "윙바디", "냉동/냉장", "특수차량"]

type Tab = "profile" | "edit" | "vehicle" | "security"

interface Props {
  profile: any
  dp: any
  matches: any[]
  completedMatches: any[]
  reviews: any[]
  totalEarned: number
  userId: string
}

function Feedback({ msg, isError }: { msg: string; isError?: boolean }) {
  return (
    <div className={`text-sm px-4 py-2.5 rounded-xl ${isError ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
      {isError ? "⚠ " : "✓ "}{msg}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-gray-900 text-sm mb-4">{children}</h3>
}

function InputField({ label, name, type = "text", defaultValue, placeholder, required }: {
  label: string; name: string; type?: string; defaultValue?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
      />
    </div>
  )
}

export function DriverMypageClient({ profile, dp, matches, completedMatches, reviews, totalEarned, userId }: Props) {
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
    if (file.size > 5 * 1024 * 1024) { showFeedback("5MB 이하 이미지만 업로드 가능합니다", true); return }

    setAvatarUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (error) { showFeedback(error.message, true); setAvatarUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
    const result = await updateAvatarUrl(publicUrl)
    if (result?.error) { showFeedback(result.error, true) } else {
      setAvatarUrl(publicUrl + "?t=" + Date.now())
      showFeedback("프로필 사진이 업데이트되었습니다")
    }
    setAvatarUploading(false)
  }

  async function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { showFeedback("10MB 이하 파일만 업로드 가능합니다", true); return }

    setDocUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${userId}/license.${ext}`
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true })
    if (error) { showFeedback(error.message, true); setDocUploading(false); return }

    const result = await updateLicenseDocUrl(path)
    if (result?.error) { showFeedback(result.error, true) } else { showFeedback("서류가 업로드되었습니다") }
    setDocUploading(false)
  }

  function handleFormAction(action: (fd: FormData) => Promise<{ error?: string; success?: boolean } | void>) {
    return (formData: FormData) => {
      startTransition(async () => {
        const result = await action(formData)
        if (result?.error) showFeedback(result.error, true)
        else if (result?.success) showFeedback("저장되었습니다")
      })
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "profile",  label: "프로필" },
    { id: "edit",     label: "정보 수정" },
    { id: "vehicle",  label: "차량·운송" },
    { id: "security", label: "보안" },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">마이페이지</h1>
          <p className="text-sm md:text-base text-gray-400 mt-2">프로필 및 계정 관리</p>
        </div>
        <span className="text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full font-semibold border border-indigo-100 sm:mt-1 self-start">기사</span>
      </div>

      {/* 프로필 요약 */}
      <div className="bg-gray-950 rounded-2xl p-4 md:p-6 text-white flex items-center gap-3 md:gap-5">
        <button onClick={() => avatarInputRef.current?.click()} className="relative shrink-0 group min-w-[60px] min-h-[60px]">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {profile?.name?.[0]}
                </div>
            }
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-white">{avatarUploading ? "업로드 중" : "변경"}</span>
          </div>
        </button>
        <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />

        <div className="flex-1 min-w-0">
          <p className="font-bold text-base md:text-lg leading-tight truncate">
            {profile?.nickname ? `"${profile.nickname}"` : ""} {profile?.name}
          </p>
          <p className="text-gray-400 text-xs md:text-sm truncate">{profile?.email}</p>
          <div className="mt-2">
            <DriverRankBadge completedCount={completedCount} size="sm" showProgress={false} />
          </div>
        </div>
        <Link href="/driver/wallet" className="shrink-0 text-center min-h-[44px] flex flex-col justify-center">
          <p className="text-xs text-gray-400">수익 지갑</p>
          <p className="font-bold text-emerald-400 text-base md:text-lg">{formatKRW(totalEarned)}</p>
        </Link>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-xs md:text-sm font-medium rounded-lg transition-all min-h-[44px] ${
              tab === t.id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {feedback && <Feedback msg={feedback.msg} isError={feedback.isError} />}

      {/* ── 프로필 탭 ── */}
      {tab === "profile" && (
        <div className="space-y-4">
          <RankCard completedCount={completedCount} />

          <button onClick={() => setShowAllRanks(s => !s)}
            className="w-full py-2.5 text-sm text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors">
            {showAllRanks ? "등급표 닫기" : "전체 등급표 보기 →"}
          </button>

          {showAllRanks && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <SectionTitle>등급 시스템</SectionTitle>
              <AllRanksTable completedCount={completedCount} />
            </div>
          )}

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              { label: "총 운송", value: `${matches.length}건` },
              { label: "완료", value: `${completedCount}건` },
              { label: "평점", value: (dp?.rating_avg || 0) > 0 ? `★ ${dp.rating_avg.toFixed(1)}` : "-" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 text-center">
                <p className="font-bold text-base md:text-lg text-emerald-700">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 리뷰 */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>받은 리뷰</SectionTitle>
              <div className="space-y-3">
                {reviews.slice(0, 5).map((r: any) => (
                  <div key={r.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-1 mb-1">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={i <= r.rating ? "text-amber-400" : "text-gray-200"}>★</span>
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

      {/* ── 정보 수정 탭 ── */}
      {tab === "edit" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6">
          {/* 아바타 */}
          <div>
            <SectionTitle>프로필 사진</SectionTitle>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-300">{profile?.name?.[0]}</div>
                }
              </div>
              <div>
                <button onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                  {avatarUploading ? "업로드 중..." : "사진 변경"}
                </button>
                <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, WEBP · 최대 5MB</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-50" />

          {/* 기본 정보 */}
          <div>
            <SectionTitle>기본 정보</SectionTitle>
            <form action={handleFormAction(updateBasicInfo)} className="space-y-3">
              <InputField label="이름" name="name" defaultValue={profile?.name} required />
              <InputField label="별명 (닉네임)" name="nickname" defaultValue={profile?.nickname} placeholder="예: 빠른배송왕" />
              <InputField label="휴대폰 번호" name="phone" type="tel" defaultValue={profile?.phone} placeholder="01012345678" />
              <button type="submit" disabled={isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {isPending ? "저장 중..." : "정보 저장"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 차량·운송 탭 ── */}
      {tab === "vehicle" && (
        <div className="space-y-4">
          {/* 차량 정보 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <SectionTitle>차량 정보</SectionTitle>
            <form action={handleFormAction(updateVehicle)} className="space-y-3">
              <InputField label="차량번호" name="vehicleNumber" defaultValue={dp?.vehicle_number} placeholder="예: 12가3456" required />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">차량 종류<span className="text-red-400 ml-0.5">*</span></label>
                <select name="vehicleType" defaultValue={dp?.vehicle_type} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                  <option value="">선택</option>
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">거주지 (홈 지역)</label>
                <select name="homeRegion" defaultValue={dp?.home_region || ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                  <option value="">미설정</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* 운송 루트 멀티셀렉 */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">운송 루트 (복수 선택)</label>
                <input type="hidden" name="routeRegions" value={selectedRoutes.join(",")} />
                <div className="flex flex-wrap gap-1.5">
                  {REGIONS.map(r => {
                    const active = selectedRoutes.includes(r)
                    return (
                      <button key={r} type="button"
                        onClick={() => setSelectedRoutes(prev =>
                          active ? prev.filter(x => x !== r) : [...prev, r]
                        )}
                        className={`px-3 py-2 min-h-[44px] rounded-full text-xs font-medium border transition-all ${
                          active
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                        }`}>
                        {r}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button type="submit" disabled={isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {isPending ? "저장 중..." : "차량 정보 저장"}
              </button>
            </form>
          </div>

          {/* 서류 업로드 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <SectionTitle>운전 자격 서류</SectionTitle>
            <p className="text-xs text-gray-400 mb-4">사업자등록증, 화물운송종사자격증 등을 업로드하세요</p>
            <div className="flex items-center gap-3">
              <button onClick={() => docInputRef.current?.click()} disabled={docUploading}
                className="px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-indigo-400 text-gray-600 hover:text-indigo-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-50">
                {docUploading ? "업로드 중..." : dp?.license_doc_url ? "서류 재업로드" : "서류 업로드"}
              </button>
              {dp?.license_doc_url && (
                <span className="text-xs text-emerald-600 font-semibold">✓ 서류 등록됨</span>
              )}
            </div>
            <input ref={docInputRef} type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={handleDocChange} />
            <p className="text-xs text-gray-400 mt-2">JPG, PNG, PDF · 최대 10MB · 관리자 검토 후 인증 처리</p>
          </div>
        </div>
      )}

      {/* ── 보안 탭 ── */}
      {tab === "security" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionTitle>비밀번호 변경</SectionTitle>
          <form action={handleFormAction(updatePassword)} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">새 비밀번호<span className="text-red-400 ml-0.5">*</span></label>
              <input type="password" name="newPassword" required placeholder="8자 이상, 특수문자 포함"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">새 비밀번호 확인<span className="text-red-400 ml-0.5">*</span></label>
              <input type="password" name="confirmPassword" required placeholder="비밀번호 재입력"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <p className="text-xs text-gray-400">8자 이상, 특수문자(!@#$% 등) 1개 이상 포함</p>
            <button type="submit" disabled={isPending}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
              {isPending ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>

          <div className="border-t border-gray-100 mt-6 pt-5">
            <p className="text-xs text-gray-500 mb-3">계정</p>
            <form action={signOut}>
              <button type="submit"
                className="w-full py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
