"use client"
import { KakaoRouteMap } from "./KakaoRouteMap"

interface RouteMapProps {
  origin: string
  destination: string
  driverLocation?: { lat: number; lng: number } | null
  onRouteInfo?: (info: { roadKm: number; timeMin: number; toll: number; fuel: number }) => void
  className?: string
}

export function RouteMap({ origin, destination, className = "" }: RouteMapProps) {
  return (
    <div className={className}>
      <KakaoRouteMap origin={origin} destination={destination} />
    </div>
  )
}
