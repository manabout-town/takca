"use client"
import dynamic from "next/dynamic"
import type { RouteMapInfo } from "./LeafletMapClient"

const LeafletMapClient = dynamic(() => import("./LeafletMapClient"), { ssr: false })

interface Props {
  origin: string
  destination: string
  driverLocation?: { lat: number; lng: number } | null
  onRouteInfo?: (info: RouteMapInfo) => void
  className?: string
}

export function LeafletRouteMap({ origin, destination, driverLocation, onRouteInfo, className = "" }: Props) {
  return (
    <div className={className}>
      <LeafletMapClient
        origin={origin}
        destination={destination}
        driverLocation={driverLocation}
        onRouteInfo={onRouteInfo}
      />
    </div>
  )
}
