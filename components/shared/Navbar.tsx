"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/app/actions/auth"
import { Logo } from "@/components/shared/Logo"
import { NotificationBell } from "@/components/shared/NotificationBell"
import type { User } from "@/lib/types"

interface NavbarProps { user: User }

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()

  const shipperNav = [
    { href: "/shipper/dashboard", label: "대시보드" },
    { href: "/shipper/orders/new", label: "의뢰 등록" },
    { href: "/shipper/wallet", label: "지갑" },
    { href: "/shipper/mypage", label: "마이페이지" },
  ]
  const driverNav = [
    { href: "/driver/dashboard", label: "대시보드" },
    { href: "/driver/feed", label: "의뢰 피드" },
    { href: "/driver/matches", label: "내 운송" },
    { href: "/driver/schedule", label: "가용일정" },
    { href: "/driver/wallet", label: "수익 지갑" },
    { href: "/driver/mypage", label: "마이페이지" },
  ]
  const adminNav = [
    { href: "/admin/dashboard", label: "대시보드" },
    { href: "/admin/drivers", label: "기사 인증" },
    { href: "/admin/disputes", label: "분쟁 관리" },
    { href: "/admin/users", label: "회원 관리" },
  ]

  const nav = user.role === "shipper" ? shipperNav
    : user.role === "driver" ? driverNav
    : adminNav

  const roleBadge = user.role === "shipper" ? "화주" : user.role === "driver" ? "기사" : "관리자"
  const roleColor = user.role === "shipper" ? "bg-indigo-50 text-indigo-700"
    : user.role === "driver" ? "bg-emerald-50 text-emerald-700"
    : "bg-amber-50 text-amber-700"

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden md:flex items-center gap-1">
            {nav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell userId={user.id} />
          <div className="hidden sm:flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColor}`}>{roleBadge}</span>
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
