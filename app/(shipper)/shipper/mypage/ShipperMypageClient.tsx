"use client"
import { useState, useTransition, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  updateBasicInfo,
  updatePassword,
  updateShipperProfile,
  updateAvatarUrl,
  updateBusinessDocUrl,
} from "@/app/actions/profile"
import { signOut } from "@/app/actions/auth"
import { formatKRW, formatDate } from "@/lib/utils/format"
import Link from "next/link"

type Tab = "profile" | "edit" | "business" | "security"

interface Props {
  profile: any
  sp: any
  orders: any[]
  completedOrders: any[]
  totalSpent: number
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

export function ShipperMypageClient({ profile, sp, orders, completedOrders, totalSpent, userId }: Props) {
  const [tab, setTab] = useState<Tab>("profile")
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ msg: string; isError: boolean } | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [docUploading, setDocUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

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
    const path = `${userId}/business_doc.${ext}`
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true })
    if (error) { showFeedback(error.message, true); setDocUploading(false); return }

    const result = await updateBusinessDocUrl(path)
    if (result?.error) { showFeedback(result.error, true) } else { showFeedback("사업자등록증이 업로드되었습니다") }
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
    { id: "business", label: "사업 정보" },
    { id: "security", label: "보안" },
  ]

  const pendingOrders    = orders.filter(o => o.status === "pending").length
  const inProgressOrders = orders.filter(o => ["matched","in_progress"].includes(o.status)).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">마이페이지</h1>
          <p className="text-base text-gray-400 mt-2">프로필 및 계정 관리</p>
        </div>
        <span className="text-xs text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full font-semibold border border-orange-100 mt-1">화주</span>
      </div>

      {/* 프로필 요약 */}
      <div className="bg-gray-950 rounded-2xl p-6 text-white flex items-center gap-5">
        <button onClick={() => avatarInputRef.current?.click()} className="relative shrink-0 group">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700">
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
          <p className="font-bold text-lg leading-tight">
            {profile?.nickname ? `"${profile.nickname}"` : ""} {profile?.name}
          </p>
          <p className="text-gray-400 text-sm">{profile?.email}</p>
          {sp?.company_name && (
            <p className="text-xs text-gray-500 mt-0.5">🏢 {sp.company_name}</p>
          )}
        </div>
        <Link href="/shipper/wallet" className="shrink-0 text-center">
          <p className="text-xs text-gray-400">총 지출</p>
          <p className="font-bold text-orange-400 text-lg">{formatKRW(totalSpent)}</p>
        </Link>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
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
          {/* 통계 */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "총 의뢰", value: `${orders.length}건`, color: "text-gray-900" },
              { label: "완료", value: `${completedOrders.length}건`, color: "text-emerald-700" },
              { label: "진행 중", value: `${inProgressOrders}건`, color: "text-orange-600" },
              { label: "대기 중", value: `${pendingOrders}건`, color: "text-amber-700" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <p className={`font-bold text-xl ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 빠른 메뉴 */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/shipper/wallet"
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-orange-200 transition-colors">
              <div className="text-xl mb-1">💳</div>
              <p className="font-semibold text-sm text-gray-900">지갑 · 결제</p>
              <p className="text-xs text-gray-400 mt-0.5">충전, 에스크로, 내역</p>
            </Link>
            <Link href="/shipper/orders/new"
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-orange-200 transition-colors">
              <div className="text-xl mb-1">📦</div>
              <p className="font-semibold text-sm text-gray-900">의뢰 등록</p>
              <p className="text-xs text-gray-400 mt-0.5">새 운송 의뢰 올리기</p>
            </Link>
          </div>

          {/* 최근 완료 내역 */}
          {completedOrders.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-semibold text-gray-900 text-sm">최근 완료 거래</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {completedOrders.slice(0, 8).map((o: any) => (
                  <Link key={o.id} href={`/shipper/orders/${o.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{o.origin} → {o.destination}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{o.cargo_type} · {formatDate(o.created_at)}</p>
                    </div>
                    <p className="font-semibold text-orange-500 text-sm">{formatKRW(o.price)}</p>
                  </Link>
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
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
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
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">이름<span className="text-red-400 ml-0.5">*</span></label>
                <input type="text" name="name" defaultValue={profile?.name} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">별명 (닉네임)</label>
                <input type="text" name="nickname" defaultValue={profile?.nickname} placeholder="예: 부산물류왕"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">휴대폰 번호</label>
                <input type="tel" name="phone" defaultValue={profile?.phone} placeholder="01012345678"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <button type="submit" disabled={isPending}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {isPending ? "저장 중..." : "정보 저장"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 사업 정보 탭 ── */}
      {tab === "business" && (
        <div className="space-y-4">
          {/* 사업자 정보 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <SectionTitle>사업자 정보</SectionTitle>
            <form action={handleFormAction(updateShipperProfile)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">회사명 / 상호명</label>
                <input type="text" name="companyName" defaultValue={sp?.company_name} placeholder="예: (주)한국물류"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">사업자등록번호</label>
                <input type="text" name="businessNumber" defaultValue={sp?.business_number} placeholder="예: 123-45-67890"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <button type="submit" disabled={isPending}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {isPending ? "저장 중..." : "사업자 정보 저장"}
              </button>
            </form>
          </div>

          {/* 사업자등록증 업로드 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <SectionTitle>사업자등록증</SectionTitle>
            <p className="text-xs text-gray-400 mb-4">사업자등록증 사본을 업로드하세요. 관리자 검토 후 인증 마크가 부여됩니다.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => docInputRef.current?.click()} disabled={docUploading}
                className="px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-orange-400 text-gray-600 hover:text-orange-600 text-sm font-medium rounded-xl transition-colors disabled:opacity-50">
                {docUploading ? "업로드 중..." : sp?.business_doc_url ? "서류 재업로드" : "📄 서류 업로드"}
              </button>
              {sp?.business_doc_url && (
                <span className="text-xs text-emerald-600 font-semibold">✓ 서류 등록됨</span>
              )}
            </div>
            <input ref={docInputRef} type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={handleDocChange} />
            <p className="text-xs text-gray-400 mt-2">JPG, PNG, PDF · 최대 10MB</p>
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
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
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
