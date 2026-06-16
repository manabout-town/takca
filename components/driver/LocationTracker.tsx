"use client"
import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface Props {
  driverId: string
  matchId?: string | null
  active: boolean
}

export function LocationTracker({ driverId, matchId, active }: Props) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const supabase = createClient()

  async function pushLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await supabase.from("driver_locations").upsert({
        driver_id: driverId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        heading: pos.coords.heading ?? null,
        speed: pos.coords.speed ?? null,
        match_id: matchId ?? null,
        updated_at: new Date().toISOString(),
      })
    }, undefined, { enableHighAccuracy: true, maximumAge: 10000 })
  }

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    pushLocation()
    intervalRef.current = setInterval(pushLocation, 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, matchId])

  return null
}
