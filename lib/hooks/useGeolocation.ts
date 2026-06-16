"use client"
import { useState, useCallback } from "react"

export interface GeoPosition {
  lat: number
  lng: number
  accuracy?: number
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentPosition = useCallback((): Promise<GeoPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("GPS 미지원 브라우저입니다"))
        return
      }
      setLoading(true)
      setError(null)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gp: GeoPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }
          setPosition(gp)
          setLoading(false)
          resolve(gp)
        },
        (err) => {
          const msg = err.code === 1 ? "위치 권한을 허용해주세요" : "위치를 가져올 수 없습니다"
          setError(msg)
          setLoading(false)
          reject(new Error(msg))
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      )
    })
  }, [])

  return { position, loading, error, getCurrentPosition }
}
