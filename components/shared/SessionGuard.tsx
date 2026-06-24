"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const INACTIVITY_MS = 30 * 60 * 1000
const CHECK_MS = 60 * 1000
const LAST_ACTIVE_KEY = "takca_last_active"

export function SessionGuard() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let timer: ReturnType<typeof setInterval> | null = null
    let watching = false

    const touch = () => sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
    const EVENTS = ["click", "keydown", "mousemove", "touchstart"] as const

    function startWatch() {
      if (watching) return
      watching = true
      touch()
      EVENTS.forEach(e => window.addEventListener(e, touch, { passive: true }))
      timer = setInterval(() => {
        const last = Number(sessionStorage.getItem(LAST_ACTIVE_KEY) || 0)
        if (Date.now() - last > INACTIVITY_MS) {
          supabase.auth.signOut().then(() => router.replace("/login"))
        }
      }, CHECK_MS)
    }

    function stopWatch() {
      if (!watching) return
      watching = false
      EVENTS.forEach(e => window.removeEventListener(e, touch))
      if (timer) { clearInterval(timer); timer = null }
    }

    // Initial session check
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace("/login")
      else startWatch()
    })

    // React to auth state changes (OAuth callback, token refresh, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        stopWatch()
        router.replace("/login")
      } else if (event === "SIGNED_IN") {
        startWatch()
      }
    })

    return () => {
      stopWatch()
      subscription.unsubscribe()
    }
  }, [router])

  return null
}
