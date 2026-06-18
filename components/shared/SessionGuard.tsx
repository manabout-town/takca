"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const INACTIVITY_MS = 30 * 60 * 1000
const CHECK_MS = 60 * 1000
const SESSION_KEY = "hwamulro_session_active"
const LAST_ACTIVE_KEY = "hwamulro_last_active"

export function SessionGuard() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    if (!sessionStorage.getItem(SESSION_KEY)) {
      supabase.auth.signOut().then(() => router.replace("/login"))
      return
    }

    const touch = () => sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
    const events = ["click", "keydown", "mousemove", "touchstart"] as const
    events.forEach(e => window.addEventListener(e, touch, { passive: true }))

    const timer = setInterval(() => {
      const last = Number(sessionStorage.getItem(LAST_ACTIVE_KEY) || 0)
      if (Date.now() - last > INACTIVITY_MS) {
        sessionStorage.removeItem(SESSION_KEY)
        sessionStorage.removeItem(LAST_ACTIVE_KEY)
        supabase.auth.signOut().then(() => router.replace("/login"))
      }
    }, CHECK_MS)

    return () => {
      events.forEach(e => window.removeEventListener(e, touch))
      clearInterval(timer)
    }
  }, [router])

  return null
}
