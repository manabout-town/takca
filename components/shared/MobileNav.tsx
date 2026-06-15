"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { UserRole } from "@/lib/types"

interface Props { role: UserRole }

const shipperItems = [
  { href: "/shipper/dashboard", icon: "🏠", label: "홈" },
  { href: "/shipper/orders/new", icon: "➕", label: "의뢰 등록" },
  { href: "/shipper/wallet", icon: "💳", label: "지갑" },
  { href: "/shipper/mypage", icon: "👤", label: "마이" },
]

const driverItems = [
  { href: "/driver/dashboard", icon: "🏠", label: "홈" },
  { href: "/driver/feed", icon: "📋", label: "피드" },
  { href: "/driver/matches", icon: "🚚", label: "운송" },
  { href: "/driver/wallet", icon: "💰", label: "수익" },
  { href: "/driver/mypage", icon: "👤", label: "마이" },
]

const adminItems = [
  { href: "/admin/dashboard", icon: "🏠", label: "홈" },
  { href: "/admin/drivers", icon: "✓", label: "기사 인증" },
  { href: "/admin/disputes", icon: "⚠️", label: "분쟁" },
  { href: "/admin/users", icon: "👥", label: "회원" },
]

export function MobileNav({ role }: Props) {
  const pathname = usePathname()
  const items = role === "shipper" ? shipperItems : role === "driver" ? driverItems : adminItems

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 safe-area-inset-bottom">
      <div className="flex items-center">
        {items.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                active ? "text-gray-900" : "text-gray-400"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className={`text-[10px] font-medium ${active ? "text-gray-900" : "text-gray-400"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
