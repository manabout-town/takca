"use client"
import { KakaoRouteMap } from "./KakaoRouteMap"

interface RouteMapProps {
  origin: string
  destination: string
  className?: string
}

export function RouteMap({ origin, destination, className = "" }: RouteMapProps) {
  return (
    <div className={className}>
      <KakaoRouteMap origin={origin} destination={destination} />
    </div>
  )
}
