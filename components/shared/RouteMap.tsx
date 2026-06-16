"use client"
import { LeafletRouteMap } from "./LeafletRouteMap"
import type { RouteMapInfo } from "./LeafletMapClient"

interface RouteMapProps {
  origin: string
  destination: string
  driverLocation?: { lat: number; lng: number } | null
  onRouteInfo?: (info: RouteMapInfo) => void
  className?: string
}

export function RouteMap({ origin, destination, driverLocation, onRouteInfo, className = "" }: RouteMapProps) {
  return (
    <LeafletRouteMap
      origin={origin}
      destination={destination}
      driverLocation={driverLocation}
      onRouteInfo={onRouteInfo}
      className={className}
    />
  )
}
