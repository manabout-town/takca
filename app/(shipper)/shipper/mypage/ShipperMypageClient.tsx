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
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, ESCROW_STATUS_LABEL } from "@/lib/utils/status"
import type { KYCStatus } from "@/lib/types"
import Link from "next/link"

type Tab = "profile" | "orders" | "payments" | "edit" | "security"

interface Props {
  profile: any
  sp: any
  orders: any[]
  completedOrders: any[]
  totalSpent: number
  escrows: any[]
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

function KycBadge({ status }: { status: KYCStatus | string }) {
  const map: Record<string, { label: string; cls: string }> = {
    verified:   { label: "인증 완료", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    pending:    { label: "심사 중",   cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    unverified: { label: "미인증",    cls: "bg-gray-100 text-gray-500 border-gray-200" },
    rejected:   { label: "반려됨",    cls: "bg-red-100 text-red-600 border-red-200" },
  }
  const cfg = map[status] ?? map.unverified
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function EscrowStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    held:     "bg-orange-100 text-orange-700",
    released: "bg-emerald-100 text-emerald-700",
    refunded: "bg-blue-100 text-blue-700",
    disputed: "bg-red-100 text-red-600",
  }
  const label = ESCROW_STATUS_LABEL[status as keyof typeof ESCROW_STATUS_LABEL] ?? status
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  )
}

const TABS: { id: Tab; label: string }[] = [
  { id: "profile",  label: "내 정보" },
  { id: "orders",   label: "의뢰 내역" },
  { id: "payments", label: "결제 내역" },
  { id: "edit",     label: "정보 수정" },
  { id: "security", label: "보안" },
]

export function ShipperMypageClient({
  profile,
  sp,
  orders,
  completedOrders,
  totalSpent,
  escrows,
  userId,
}: Props) {
  const [tab, setTab] = useState<Tab>("profile")
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ msg: string; isError: boolean } | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [docUploading, setDocUploading] = useState(false)
  const [orderPage, setOrderPage] = useState(0)
  const ORDER_PAGE_SIZE = 10
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

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
    const path = `${userId}/business_doc.${ext}`
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true })
    if (error) {
      showFeedback(error.message, true)
      setDocUploading(false)
      return
    }
    const result = await updateBusinessDocUrl(path)
    if (result?.error) {
      showFeedback(result.error, true)
    } else {
      showFeedback("사업자등록증이 업로드되었습니다")
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

  const pendingOrders    = orders.filter((o) => o.status === "pending").length
  const inProgressOrders = orders.filter((o) => ["matched", "in_progress"].includes(o.status)).length
  const cancelledOrders  = orders.filter((o) => o.status === "cancelled").length

  // Orders pagination
  const totalPages  = Math.ceil(orders.length / ORDER_PAGE_SIZE)
  const pagedOrders = orders.slice(orderPage * ORDER_PAGE_SIZE, (orderPage + 1) * ORDER_PAGE_SIZE)

  // Escrow stats
  const heldTotal     = escrows.filter((e) => e.status === "held").reduce((s, e) => s + (e.total_amount || 0), 0)
  const releasedTotal = escrows.filter((e) => e.status === "released").reduce((s, e) => s + (e.total_amount || 0), 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">마이페이지</h1>
          <p className="text-base text-gray-400 mt-2">프로필 및 계정 관리</p>
        </div>
        <span className="text-xs text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full font-semibold border border-orange-100 mt-1">
          화주
        </span>
      </div>

      {/* Profile summary card */}
      <div className="bg-gray-950 rounded-2xl p-6 text-white flex items-center gap-5">
        <button
          onClick={() => avatarInputRef.current?.click()}
          className="relative shrink-0 group"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700">
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
          <p className="font-bold text-lg leading-tight">
            {profile?.nickname ? `"${profile.nickname}" ` : ""}
            {profile?.name}
          </p>
          <p className="text-gray-400 text-sm">{profile?.email}</p>
          {sp?.company_name && (
            <p className="text-xs text-gray-500 mt-0.5">🏢 {sp.company_name}</p>
          )}
          <div className="mt-2">
            <KycBadge status={profile?.verification_status || "unverified"} />
          </div>
        </div>
        <Link href="/shipper/wallet" className="shrink-0 text-center">
          <p className="text-xs text-gray-400">총 지출</p>
          <p className="font-bold text-[#FF6B2B] text-lg">{formatKRW(totalSpent)}</p>
        </Link>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
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
                { label: "이름",   value: profile?.name },
                { label: "이메일", value: profile?.email },
                { label: "전화번호", value: profile?.phone || "미등록" },
                { label: "역할",   value: "화주" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-medium text-gray-900 truncate">{value}</p>
                </div>
              ))}
              {sp?.company_name && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">회사명</p>
                  <p className="font-medium text-gray-900">{sp.company_name}</p>
                </div>
              )}
            </div>
            <div className="pt-1">
              <p className="text-xs text-gray-400 mb-1.5">KYC 인증 상태</p>
              <KycBadge status={profile?.verification_status || "unverified"} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "총 의뢰",  value: `${orders.length}건`,       color: "text-gray-900" },
              { label: "완료",     value: `${completedOrders.length}건`, color: "text-emerald-700" },
              { label: "진행 중",  value: `${inProgressOrders}건`,    color: "text-[#FF6B2B]" },
              { label: "대기 중",  value: `${pendingOrders}건`,       color: "text-amber-700" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <p className={`font-bold text-xl ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick menu */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/shipper/wallet"
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-orange-200 transition-colors"
            >
              <div className="text-xl mb-1">💳</div>
              <p className="font-semibold text-sm text-gray-900">지갑 · 결제</p>
              <p className="text-xs text-gray-400 mt-0.5">충전, 에스크로, 내역</p>
            </Link>
            <Link
              href="/shipper/orders/new"
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-orange-200 transition-colors"
            >
              <div className="text-xl mb-1">📦</div>
              <p className="font-semibold text-sm text-gray-900">의뢰 등록</p>
              <p className="text-xs text-gray-400 mt-0.5">새 운송 의뢰 올리기</p>
            </Link>
          </div>
        </div>
      )}

      {/* ── Tab: 의뢰 내역 ── */}
      {tab === "orders" && (
        <div className="space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "전체",    value: orders.length,          color: "text-gray-900" },
              { label: "진행중",  value: inProgressOrders,       color: "text-[#FF6B2B]" },
              { label: "완료",    value: completedOrders.length, color: "text-emerald-600" },
              { label: "취소",    value: cancelledOrders,        color: "text-gray-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-semibold text-gray-700">등록된 의뢰가 없습니다</p>
              <Link
                href="/shipper/orders/new"
                className="inline-block mt-4 px-5 py-2.5 bg-[#FF6B2B] text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
              >
                첫 의뢰 등록하기
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {pagedOrders.map((o: any) => (
                  <Link
                    key={o.id}
                    href={`/shipper/orders/${o.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            ORDER_STATUS_COLOR[o.status as keyof typeof ORDER_STATUS_COLOR] ??
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {ORDER_STATUS_LABEL[o.status as keyof typeof ORDER_STATUS_LABEL] ?? o.status}
                        </span>
                        {o.is_urgent && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                            긴급
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {o.origin} → {o.destination}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(o.created_at)}</p>
                    </div>
                    <p className="font-semibold text-[#FF6B2B] text-sm shrink-0 ml-3">
                      {formatKRW(o.price)}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 bg-gray-50/50">
                  <button
                    onClick={() => setOrderPage((p) => Math.max(0, p - 1))}
                    disabled={orderPage === 0}
                    className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                  >
                    이전
                  </button>
                  <span className="text-xs text-gray-400">
                    {orderPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setOrderPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={orderPage >= totalPages - 1}
                    className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: 결제 내역 ── */}
      {tab === "payments" && (
        <div className="space-y-4">
          {/* Escrow summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-xl font-bold text-[#FF6B2B]">{formatKRW(heldTotal)}</p>
              <p className="text-xs text-gray-500 mt-1">보관 중 (에스크로)</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-xl font-bold text-emerald-600">{formatKRW(releasedTotal)}</p>
              <p className="text-xs text-gray-500 mt-1">정산 완료</p>
            </div>
          </div>

          {escrows.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-4xl mb-3">💳</p>
              <p className="font-semibold text-gray-700">결제 내역이 없습니다</p>
              <p className="text-xs text-gray-400 mt-1">의뢰 완료 후 에스크로 내역이 표시됩니다</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-semibold text-gray-900 text-sm">에스크로 / 결제 내역</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {escrows.map((e: any) => {
                  const order = e.orders
                  return (
                    <div key={e.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <EscrowStatusBadge status={e.status} />
                          </div>
                          <p className="text-sm font-medium text-gray-800">
                            {order?.origin} → {order?.destination}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            보관일: {e.held_at ? formatDate(e.held_at) : "-"}
                            {e.released_at && ` · 정산: ${formatDate(e.released_at)}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900 text-sm">
                            {formatKRW(e.total_amount)}
                          </p>
                          {e.platform_fee > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              플랫폼 수수료 {formatKRW(e.platform_fee)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/shipper/wallet"
              className="inline-flex items-center gap-1.5 text-sm text-[#FF6B2B] font-semibold hover:underline"
            >
              전체 지갑 내역 보기 →
            </Link>
          </div>
        </div>
      )}

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
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    이름<span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={profile?.name}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">별명 (닉네임)</label>
                  <input
                    type="text"
                    name="nickname"
                    defaultValue={profile?.nickname}
                    placeholder="예: 부산물류왕"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">휴대폰 번호</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={profile?.phone}
                    placeholder="01012345678"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent"
                  />
                </div>
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

          {/* Business info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <SectionTitle>사업자 정보</SectionTitle>
            <form action={handleFormAction(updateShipperProfile)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  회사명 / 상호명
                </label>
                <input
                  type="text"
                  name="companyName"
                  defaultValue={sp?.company_name}
                  placeholder="예: (주)한국물류"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">사업자등록번호</label>
                <input
                  type="text"
                  name="businessNumber"
                  defaultValue={sp?.business_number}
                  placeholder="예: 123-45-67890"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-[#FF6B2B] hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {isPending ? "저장 중..." : "사업자 정보 저장"}
              </button>
            </form>
          </div>

          {/* Business doc upload */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <SectionTitle>사업자등록증</SectionTitle>
            <p className="text-xs text-gray-400 mb-4">
              사업자등록증 사본을 업로드하세요. 관리자 검토 후 인증 마크가 부여됩니다.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => docInputRef.current?.click()}
                disabled={docUploading}
                className="px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-[#FF6B2B] text-gray-600 hover:text-[#FF6B2B] text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {docUploading ? "업로드 중..." : sp?.business_doc_url ? "서류 재업로드" : "📄 서류 업로드"}
              </button>
              {sp?.business_doc_url && (
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
            <p className="text-xs text-gray-400 mt-2">JPG, PNG, PDF · 최대 10MB</p>
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
