"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RouteMap } from "./RouteMap"

interface Props {
  origin: string
  destination: string
  driverId: string | null | undefined
  matchId: string | null | undefined
  showTracking: boolean
}

export function DriverLocationMap({ origin, destination, driverId, matchId, showTracking }: Props) {
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!showTracking || !driverId) return

    // Initial fetch
    supabase.from("driver_locations").select("lat, lng").eq("driver_id", driverId).single().then(({ data }) => {
      if (data) setDriverLocation({ lat: data.lat, lng: data.lng })
    })

    // Realtime subscription
    const channel = supabase.channel(`driver-loc-${driverId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "driver_locations",
        filter: `driver_id=eq.${driverId}`,
      }, (payload: any) => {
        if (payload.new?.lat) {
          setDriverLocation({ lat: payload.new.lat, lng: payload.new.lng })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [driverId, showTracking])

  return (
    <div>
      <RouteMap
        origin={origin}
        destination={destination}
        driverLocation={showTracking ? driverLocation : null}
      />
      {showTracking && driverLocation && (
        <p className="text-xs text-indigo-500 mt-2 text-center">🚛 기사 실시간 위치 추적 중</p>
      )}
    </div>
  )
}
