"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface Photo {
  id: string
  phase: "before" | "after"
  storage_path: string
  uploaded_at: string
  url?: string
}

interface Props {
  matchId: string
  isDriver: boolean
  matchStatus: string
}

export function CargoPhotoSection({ matchId, isDriver, matchStatus }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState<"before" | "after" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchPhotos = useCallback(async () => {
    const { data } = await supabase
      .from("cargo_photos")
      .select("*")
      .eq("match_id", matchId)
      .order("uploaded_at", { ascending: true })

    if (!data) return

    const withUrls = await Promise.all(
      data.map(async (photo) => {
        const { data: signed } = await supabase.storage
          .from("cargo-photos")
          .createSignedUrl(photo.storage_path, 3600)
        return { ...photo, url: signed?.signedUrl }
      })
    )
    setPhotos(withUrls)
  }, [matchId, supabase])

  useEffect(() => {
    fetchPhotos()

    const channel = supabase
      .channel(`cargo-photos-${matchId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "cargo_photos",
        filter: `match_id=eq.${matchId}`,
      }, () => { fetchPhotos() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [matchId, fetchPhotos, supabase])

  async function handleUpload(phase: "before" | "after", file: File) {
    setUploading(phase)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const ext = file.name.split(".").pop() || "jpg"
      const path = `${matchId}/${phase}_${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("cargo-photos")
        .upload(path, file, { contentType: file.type })

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase.from("cargo_photos").insert({
        match_id: matchId,
        uploaded_by: user.id,
        phase,
        storage_path: path,
      })

      if (dbError) throw dbError
      await fetchPhotos()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(null)
    }
  }

  const beforePhoto = photos.find(p => p.phase === "before")
  const afterPhoto = photos.find(p => p.phase === "after")
  const canUploadBefore = isDriver && !beforePhoto && ["accepted", "in_progress"].includes(matchStatus)
  const canUploadAfter = isDriver && !afterPhoto && matchStatus === "in_progress" && !!beforePhoto

  if (!isDriver && photos.length === 0) return null

  return (
    <div className="border-t border-gray-100 px-4 py-3 bg-white shrink-0">
      <p className="text-xs font-semibold text-gray-500 mb-2.5">📸 차량 사진</p>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <div className="grid grid-cols-2 gap-2.5">
        <PhotoSlot
          label="픽업 전"
          photo={beforePhoto}
          canUpload={canUploadBefore}
          uploading={uploading === "before"}
          onUpload={(file) => handleUpload("before", file)}
          placeholder={isDriver ? "사진 추가" : "미촬영"}
        />
        <PhotoSlot
          label="배송 완료"
          photo={afterPhoto}
          canUpload={canUploadAfter}
          uploading={uploading === "after"}
          onUpload={(file) => handleUpload("after", file)}
          placeholder={beforePhoto ? (isDriver ? "완료 사진" : "미촬영") : "픽업 후 추가"}
        />
      </div>
    </div>
  )
}

function PhotoSlot({
  label, photo, canUpload, uploading, onUpload, placeholder
}: {
  label: string
  photo: Photo | undefined
  canUpload: boolean
  uploading: boolean
  onUpload: (file: File) => void
  placeholder: string
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {photo?.url ? (
        <a href={photo.url} target="_blank" rel="noopener noreferrer">
          <img
            src={photo.url}
            alt={label}
            className="w-full aspect-square object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity"
          />
        </a>
      ) : canUpload ? (
        <label className={`flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          uploading ? "border-gray-200 bg-gray-50" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
        }`}>
          <span className="text-xl mb-1">{uploading ? "⏳" : "📷"}</span>
          <span className="text-xs text-gray-400">{uploading ? "업로드 중..." : placeholder}</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file)
              e.target.value = ""
            }}
          />
        </label>
      ) : (
        <div className="w-full aspect-square border border-dashed border-gray-100 rounded-xl flex items-center justify-center">
          <span className="text-xs text-gray-300">{placeholder}</span>
        </div>
      )}
    </div>
  )
}
