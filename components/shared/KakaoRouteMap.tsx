"use client"
import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    kakao: any
  }
}

// 주요 도시 좌표 (위도, 경도)
const CITY_COORDS: Record<string, [number, number]> = {
  "서울": [37.5665, 126.9780], "부산": [35.1796, 129.0756],
  "대구": [35.8714, 128.6014], "인천": [37.4563, 126.7052],
  "광주": [35.1595, 126.8526], "대전": [36.3504, 127.3845],
  "울산": [35.5384, 129.3114], "세종": [36.4800, 127.2890],
  "수원": [37.2636, 127.0286], "고양": [37.6584, 126.8320],
  "용인": [37.2411, 127.1776], "창원": [35.2285, 128.6811],
  "성남": [37.4449, 127.1388], "청주": [36.6424, 127.4890],
  "부천": [37.5034, 126.7660], "천안": [36.8151, 127.1139],
  "전주": [35.8219, 127.1489], "포항": [36.0190, 129.3435],
  "원주": [37.3422, 127.9202], "춘천": [37.8813, 127.7300],
  "강릉": [37.7519, 128.8761], "제주": [33.4996, 126.5312],
  "여수": [34.7604, 127.6622], "순천": [34.9506, 127.4872],
  "목포": [34.8118, 126.3922], "안산": [37.3219, 126.8310],
  "안양": [37.3943, 126.9568], "남양주": [37.6359, 127.2163],
  "평택": [36.9921, 127.1127], "화성": [37.1993, 126.8314],
  "파주": [37.7597, 126.7799], "군포": [37.3614, 126.9351],
  "의정부": [37.7381, 127.0337], "경주": [35.8562, 129.2247],
  "구미": [36.1198, 128.3444], "안동": [36.5684, 128.7294],
  "진주": [35.1800, 128.1076], "거제": [34.8804, 128.6210],
  "김해": [35.2281, 128.8897], "양산": [35.3352, 129.0360],
  "익산": [35.9483, 126.9576], "군산": [35.9676, 126.7368],
  "충주": [36.9910, 127.9259], "공주": [36.4465, 127.1190],
  "아산": [36.7895, 127.0021], "서산": [36.7848, 126.4503],
  "속초": [38.2070, 128.5918], "삼척": [37.4500, 129.1656],
  "광명": [37.4784, 126.8643], "시흥": [37.3800, 126.8032],
  "나주": [35.0159, 126.7107], "제천": [37.1329, 128.1907],
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function findCityCoords(addr: string): [number, number] | null {
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (addr.includes(city)) return coords
  }
  return null
}

export function estimateRouteInfo(origin: string, destination: string) {
  const o = findCityCoords(origin)
  const d = findCityCoords(destination)
  if (!o || !d) return null
  const crowKm = haversineKm(o[0], o[1], d[0], d[1])
  const roadKm = Math.round(crowKm * 1.28) // 도로 거리 ≈ 직선 × 1.28
  const timeMin = Math.round((roadKm / 80) * 60) // 80km/h 기준
  const toll = Math.round(roadKm * 75 / 100) * 100 // ~75원/km 반올림
  const fuel = Math.round((roadKm * 0.28 * 1850) / 100) * 100 // 트럭 0.28L/km × 1850원/L
  return { crowKm, roadKm, timeMin, toll, fuel }
}

// SVG Fallback (API 키 없을 때)
function RouteMapFallback({ origin, destination, info }: {
  origin: string
  destination: string
  info: ReturnType<typeof estimateRouteInfo>
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-5 py-4">
        <svg viewBox="0 0 440 100" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <defs>
            <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <marker id="arr" markerWidth="7" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 7 3, 0 6" fill="#10B981" />
            </marker>
          </defs>
          <line x1="80" y1="50" x2="360" y2="50" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="6,5" />
          <path d="M 80 50 Q 220 15 360 50" fill="none" stroke="url(#rg)"
            strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arr)" />
          <circle cx="80" cy="50" r="11" fill="#4F46E5" />
          <text x="80" y="54" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">출</text>
          <circle cx="360" cy="50" r="11" fill="#10B981" />
          <text x="360" y="54" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">도</text>
          {info && (
            <text x="220" y="12" textAnchor="middle" fill="#6366F1" fontSize="11" fontWeight="600">
              약 {info.roadKm}km
            </text>
          )}
        </svg>
        <div className="flex justify-between mt-1 px-1">
          <div>
            <div className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wider">출발</div>
            <div className="text-xs font-medium text-gray-700 max-w-[160px] truncate">{origin}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wider">도착</div>
            <div className="text-xs font-medium text-gray-700 max-w-[160px] truncate">{destination}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface KakaoRouteMapProps {
  origin: string
  destination: string
}

export function KakaoRouteMap({ origin, destination }: KakaoRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading")
  const [routeInfo, setRouteInfo] = useState<ReturnType<typeof estimateRouteInfo>>(null)

  // 거리 사전 계산 (fallback & table)
  useEffect(() => {
    setRouteInfo(estimateRouteInfo(origin, destination))
  }, [origin, destination])

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY
    if (!key) { setMapState("error"); return }

    const initMap = () => {
      if (!mapRef.current) return
      const { maps } = window.kakao
      const center = new maps.LatLng(36.5, 127.5)
      const map = new maps.Map(mapRef.current, { center, level: 10 })
      const geocoder = new maps.services.Geocoder()

      let oCoords: any = null
      let dCoords: any = null

      const tryRender = () => {
        if (!oCoords || !dCoords) return
        const bounds = new maps.LatLngBounds()
        bounds.extend(oCoords); bounds.extend(dCoords)
        map.setBounds(bounds, 60)

        // 출발 마커 (인디고)
        const oMarker = new maps.Marker({ map, position: oCoords, title: origin })
        const dMarker = new maps.Marker({ map, position: dCoords, title: destination })

        // 출발 오버레이
        const makeOverlay = (pos: any, label: string, color: string) => {
          const content = `<div style="
            background:${color};color:#fff;padding:3px 8px;border-radius:12px;
            font-size:11px;font-weight:700;white-space:nowrap;
            box-shadow:0 2px 6px rgba(0,0,0,0.25);
          ">${label}</div>`
          new maps.CustomOverlay({ map, position: pos, content, yAnchor: 2.2 })
        }
        makeOverlay(oCoords, "출발: " + origin, "#4F46E5")
        makeOverlay(dCoords, "도착: " + destination, "#10B981")

        // 경로선 (점선)
        new maps.Polyline({
          map,
          path: [oCoords, dCoords],
          strokeWeight: 3,
          strokeColor: "#4F46E5",
          strokeOpacity: 0.6,
          strokeStyle: "dashed",
        })

        // 거리 계산
        const dist = maps.geometry?.spherical?.computeDistanceBetween(oCoords, dCoords)
        if (dist) {
          const crowKm = Math.round(dist / 1000)
          const roadKm = Math.round(crowKm * 1.28)
          const timeMin = Math.round((roadKm / 80) * 60)
          const toll = Math.round(roadKm * 75 / 100) * 100
          const fuel = Math.round((roadKm * 0.28 * 1850) / 100) * 100
          setRouteInfo({ crowKm, roadKm, timeMin, toll, fuel })
        }

        setMapState("ready")
      }

      geocoder.addressSearch(origin, (res: any, status: any) => {
        if (status === maps.services.Status.OK) {
          oCoords = new maps.LatLng(parseFloat(res[0].y), parseFloat(res[0].x))
          tryRender()
        } else setMapState("error")
      })
      geocoder.addressSearch(destination, (res: any, status: any) => {
        if (status === maps.services.Status.OK) {
          dCoords = new maps.LatLng(parseFloat(res[0].y), parseFloat(res[0].x))
          tryRender()
        } else setMapState("error")
      })
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(initMap)
      return
    }

    const script = document.createElement("script")
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services,geometry&autoload=false`
    script.onload = () => window.kakao.maps.load(initMap)
    script.onerror = () => setMapState("error")
    document.head.appendChild(script)
  }, [origin, destination])

  return (
    <div className="space-y-3">
      {/* 지도 */}
      {mapState === "error" ? (
        <RouteMapFallback origin={origin} destination={destination} info={routeInfo} />
      ) : (
        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-56 rounded-2xl border border-gray-100 bg-gray-100"
          />
          {mapState === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-100">
              <div className="text-xs text-gray-400 animate-pulse">지도 로딩 중...</div>
            </div>
          )}
        </div>
      )}

      {/* 거리/시간/비용 정보 테이블 */}
      {routeInfo && <RouteInfoTable info={routeInfo} />}
    </div>
  )
}

function RouteInfoTable({ info }: { info: NonNullable<ReturnType<typeof estimateRouteInfo>> }) {
  const { roadKm, timeMin, toll, fuel } = info
  const hours = Math.floor(timeMin / 60)
  const mins = timeMin % 60
  const timeStr = hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`

  const rows = [
    { label: "예상 거리", value: `약 ${roadKm.toLocaleString()}km`, note: "도로 기준" },
    { label: "예상 소요 시간", value: timeStr, note: "평균 80km/h" },
    { label: "예상 통행료", value: `약 ${toll.toLocaleString()}원`, note: "구간별 상이" },
    { label: "예상 연료비", value: `약 ${fuel.toLocaleString()}원`, note: "5톤 기준" },
  ]

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">운송 정보 (추정)</span>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-500">{r.label}</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">{r.value}</span>
              <span className="text-[10px] text-gray-400 ml-1.5">{r.note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
