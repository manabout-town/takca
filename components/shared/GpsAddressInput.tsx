"use client"
import { useState, useRef, useEffect } from "react"
import { useGeolocation } from "@/lib/hooks/useGeolocation"
import { MapPin, Search, X } from "lucide-react"

declare global {
  interface Window {
    daum: any
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`,
      { headers: { "User-Agent": "takca-app/1.0" } }
    )
    const data = await res.json()
    const { road, city_district, city, county, state } = data.address || {}
    return [road, city_district || county, city || state].filter(Boolean).join(" ")
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

interface Props {
  name: string
  label: string
  placeholder?: string
  value: string
  onChange: (val: string) => void
  required?: boolean
}

export function GpsAddressInput({ name, label, placeholder, value, onChange, required }: Props) {
  const { loading, getCurrentPosition } = useGeolocation()
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const embedRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 다음 우편번호 스크립트 로드
  useEffect(() => {
    if (document.getElementById("daum-postcode-script")) return
    const script = document.createElement("script")
    script.id = "daum-postcode-script"
    script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
    document.head.appendChild(script)
  }, [])

  // open 상태 변경 시 embed
  useEffect(() => {
    if (!open || !embedRef.current) return

    const tryEmbed = () => {
      if (!window.daum?.Postcode) {
        setTimeout(tryEmbed, 100)
        return
      }
      embedRef.current!.innerHTML = ""
      new window.daum.Postcode({
        oncomplete: (data: any) => {
          onChange(data.roadAddress || data.jibunAddress)
          setOpen(false)
        },
        width: "100%",
        height: "100%",
      }).embed(embedRef.current)
    }

    tryEmbed()
  }, [open])

  // 외부 클릭 닫기
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  async function handleGps() {
    setGpsError(null)
    try {
      const pos = await getCurrentPosition()
      const address = await reverseGeocode(pos.lat, pos.lng)
      onChange(address)
    } catch (e: any) {
      setGpsError(e.message)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type="text"
          name={name}
          className="input pr-20"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          readOnly
          onClick={() => setOpen(v => !v)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
            title="주소 검색"
          >
            <Search size={15} />
          </button>
          <button
            type="button"
            onClick={handleGps}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-40"
            title="현재 위치"
          >
            {loading
              ? <span className="w-4 h-4 block border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              : <MapPin size={15} />
            }
          </button>
        </div>
      </div>

      {/* 드롭다운 레이어 */}
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500">주소 검색</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <div ref={embedRef} style={{ height: 340 }} />
        </div>
      )}

      {gpsError && <p className="text-xs text-red-500 mt-1">{gpsError}</p>}
    </div>
  )
}
