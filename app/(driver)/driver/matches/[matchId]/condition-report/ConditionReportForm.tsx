"use client"
import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { submitConditionReport } from "@/app/actions/conditionReport"
import type { ChecklistData, PhotoData } from "@/app/actions/conditionReport"
import { formatKRW } from "@/lib/utils/format"

interface Order {
  id: string
  origin: string
  destination: string
  price: number
  pickup_at: string
}

interface Props {
  matchId: string
  type: "pickup" | "delivery"
  order: Order
  alreadySubmitted: boolean
}

const CHECKLIST_ITEMS: { key: keyof Omit<ChecklistData, "mileage">; label: string; icon: string }[] = [
  { key: "exterior_ok", label: "외관 (스크래치/凹陷 없음)", icon: "🚗" },
  { key: "glass_ok", label: "유리 (파손 없음)", icon: "🪟" },
  { key: "tires_ok", label: "타이어 (펑크 없음)", icon: "⚙️" },
  { key: "interior_ok", label: "내부 (깨끗한 상태)", icon: "💺" },
  { key: "engine_ok", label: "엔진 이상 없음", icon: "🔧" },
]

interface UploadedPhoto {
  url: string
  caption: string
  localPreview: string
}

export function ConditionReportForm({ matchId, type, order, alreadySubmitted }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [checklist, setChecklist] = useState<ChecklistData>({
    exterior_ok: false,
    glass_ok: false,
    tires_ok: false,
    interior_ok: false,
    engine_ok: false,
    mileage: null,
  })
  const [notes, setNotes] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const title = type === "pickup" ? "픽업 전 차량 상태 확인" : "인도 후 차량 상태 확인"
  const subtitle = type === "pickup"
    ? "차량 픽업 전 현재 상태를 기록합니다"
    : "차량 인도 후 최종 상태를 기록합니다"

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (photos.length + files.length > 6) {
      setError("사진은 최대 6장까지 업로드할 수 있습니다")
      return
    }

    setUploading(true)
    setError(null)

    for (const file of files) {
      try {
        const localPreview = URL.createObjectURL(file)
        const ext = file.name.split(".").pop() || "jpg"
        const path = `${matchId}/${type}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("condition-reports")
          .upload(path, file, { contentType: file.type })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("condition-reports")
          .getPublicUrl(path)

        setPhotos(prev => [...prev, { url: publicUrl, caption: "", localPreview }])
      } catch (e: any) {
        setError(`사진 업로드 실패: ${e.message}`)
        break
      }
    }

    setUploading(false)
    e.target.value = ""
  }

  function removePhoto(index: number) {
    setPhotos(prev => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].localPreview)
      next.splice(index, 1)
      return next
    })
  }

  function toggleChecklist(key: keyof Omit<ChecklistData, "mileage">) {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const photoData: PhotoData[] = photos.map(p => ({ url: p.url, caption: p.caption }))
      const result = await submitConditionReport(matchId, type, photoData, checklist, notes)
      if (result.error) {
        setError(result.error)
      } else {
        router.push(`/chat/${matchId}`)
        router.refresh()
      }
    })
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-100">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">이미 제출되었습니다</h2>
          <p className="text-sm text-gray-500 mb-6">
            {type === "pickup" ? "픽업" : "인도"} 상태 리포트가 이미 제출되었습니다
          </p>
          <button
            onClick={() => router.push(`/chat/${matchId}`)}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
          >
            채팅으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-lg transition-colors shrink-0"
          >
            ←
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-base">{title}</h1>
            <p className="text-xs text-gray-400">{order.origin} → {order.destination}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-24">
        {/* Info card */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <p className="text-sm text-indigo-700 font-medium">{subtitle}</p>
          <p className="text-xs text-indigo-500 mt-1">
            리포트는 분쟁 발생 시 증거 자료로 활용됩니다
          </p>
        </div>

        {/* Photo upload */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">사진 촬영 <span className="text-gray-400 font-normal">({photos.length}/6)</span></h2>
            {photos.length < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs text-indigo-600 font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {uploading ? "업로드 중..." : "+ 사진 추가"}
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />

          {photos.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full aspect-[3/1] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              <span className="text-2xl">📷</span>
              <span className="text-sm text-gray-400">
                {uploading ? "업로드 중..." : "사진을 추가하세요 (최대 6장)"}
              </span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative aspect-square">
                  <img
                    src={photo.localPreview}
                    alt={`차량 사진 ${i + 1}`}
                    className="w-full h-full object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  <span className="text-lg">+</span>
                  <span className="text-xs text-gray-400">추가</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm">차량 상태 체크리스트</h2>
          <div className="space-y-2">
            {CHECKLIST_ITEMS.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleChecklist(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                  checklist[item.key]
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <span className={`flex-1 text-sm font-medium ${
                  checklist[item.key] ? "text-emerald-700" : "text-gray-700"
                }`}>
                  {item.label}
                </span>
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  checklist[item.key]
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300 bg-white"
                }`}>
                  {checklist[item.key] && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Mileage */}
          <div className="pt-1">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              주행거리 (km) <span className="text-gray-400 font-normal">선택</span>
            </label>
            <input
              type="number"
              min={0}
              value={checklist.mileage ?? ""}
              onChange={e => setChecklist(prev => ({
                ...prev,
                mileage: e.target.value ? Number(e.target.value) : null
              }))}
              placeholder="예: 45230"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
          <h2 className="font-semibold text-gray-900 text-sm">기타 특이사항 <span className="text-gray-400 font-normal">선택</span></h2>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="추가로 기록할 사항이 있으면 입력하세요..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </form>

      {/* Sticky submit button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto">
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={isPending || uploading}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-xl text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "제출 중..." : `${type === "pickup" ? "픽업 전" : "인도 후"} 리포트 제출`}
          </button>
        </div>
      </div>
    </div>
  )
}
