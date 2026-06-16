"use client"
import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix Leaflet default marker icon in webpack/Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  })
}

const orangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

async function geocode(address: string): Promise<[number, number] | null> {
  try {
    const q = encodeURIComponent(address.includes("한국") ? address : address + " 한국")
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=kr`,
      { headers: { "Accept-Language": "ko", "User-Agent": "hwamulro-app/1.0" } }
    )
    const data = await res.json()
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch {}
  return null
}

async function getRoute(from: [number, number], to: [number, number]): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (data.code === "Ok") {
      return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number])
    }
  } catch {}
  return [from, to]
}

function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371
  const dLat = (b[0] - a[0]) * Math.PI / 180
  const dLon = (b[1] - a[1]) * Math.PI / 180
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(positions as any, { padding: [40, 40] })
    }
  }, [positions, map])
  return null
}

export interface RouteMapInfo {
  roadKm: number
  timeMin: number
  toll: number
  fuel: number
}

interface Props {
  origin: string
  destination: string
  driverLocation?: { lat: number; lng: number } | null
  onRouteInfo?: (info: RouteMapInfo) => void
}

export default function LeafletMapClient({ origin, destination, driverLocation, onRouteInfo }: Props) {
  const [oCoords, setOCoords] = useState<[number, number] | null>(null)
  const [dCoords, setDCoords] = useState<[number, number] | null>(null)
  const [route, setRoute] = useState<[number, number][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    Promise.all([geocode(origin), geocode(destination)]).then(async ([o, d]) => {
      if (cancelled) return
      if (!o || !d) { setError(true); setLoading(false); return }
      setOCoords(o)
      setDCoords(d)

      const routePoints = await getRoute(o, d)
      if (!cancelled) {
        setRoute(routePoints)
        const crowKm = haversineKm(o, d)
        const roadKm = Math.round(crowKm * 1.28)
        onRouteInfo?.({
          roadKm,
          timeMin: Math.round((roadKm / 80) * 60),
          toll: Math.round(roadKm * 75 / 100) * 100,
          fuel: Math.round((roadKm * 0.28 * 1850) / 100) * 100,
        })
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [origin, destination])

  if (error) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center text-sm text-gray-400">
        지도를 불러올 수 없습니다 · {origin} → {destination}
      </div>
    )
  }

  const center: [number, number] = oCoords || [36.5, 127.5]
  const allPositions = [
    ...(oCoords ? [oCoords] : []),
    ...(dCoords ? [dCoords] : []),
    ...(driverLocation ? [[driverLocation.lat, driverLocation.lng] as [number, number]] : []),
  ]

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-100" style={{ height: 240 }}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <span className="text-xs text-gray-400 animate-pulse">지도 로딩 중...</span>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {allPositions.length >= 2 && <FitBounds positions={allPositions} />}
        {oCoords && (
          <Marker position={oCoords} icon={orangeIcon}>
            <Popup>출발: {origin}</Popup>
          </Marker>
        )}
        {dCoords && (
          <Marker position={dCoords} icon={greenIcon}>
            <Popup>도착: {destination}</Popup>
          </Marker>
        )}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={blueIcon}>
            <Popup>🚛 기사 현재 위치</Popup>
          </Marker>
        )}
        {route.length >= 2 && (
          <Polyline positions={route} color="#f97316" weight={3} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  )
}
