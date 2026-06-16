"use client"
import { useState } from "react"
import { useGeolocation } from "@/lib/hooks/useGeolocation"
import { MapPin } from "lucide-react"

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`,
      { headers: { "User-Agent": "hwamulro-app/1.0" } }
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
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type="text"
          name={name}
          className="input pr-10"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
        />
        <button
          type="button"
          onClick={handleGps}
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-40"
          title="현재 위치 자동 입력"
        >
          {loading
            ? <span className="w-4 h-4 block border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            : <MapPin size={16} />
          }
        </button>
      </div>
      {gpsError && <p className="text-xs text-red-500 mt-1">{gpsError}</p>}
    </div>
  )
}
