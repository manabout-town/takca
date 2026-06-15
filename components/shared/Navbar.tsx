"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/app/actions/auth"
import type { User } from "@/lib/types"

interface NavbarProps { user: User }

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()

  const shipperNav = [
    { href: "/shipper/dashboard", label: "대시보드" },
    { href: "/shipper/orders/new", label: "의뢰 등록" },
    { href: "/shipper/mypage", label: "마이페이지" },
  ]
  const driverNav = [
    { href: "/driver/dashboard", label: "대시보드" },
    { href: "/driver/feed", label: "의뢰 피드" },
    { href: "/driver/matches", label: "내 운송" },
    { href: "/driver/mypage", label: "마이페이지" },
  ]
  const adminNav = [
    { href: "/admin/dashboard", label: "대시보드" },
    { href: "/admin/disputes", label: "분쟁 관리" },
    { href: "/admin/users", label: "회원 관리" },
  ]

  const nav = user.role === "shipper" ? shipperNav
    : user.role === "driver" ? driverNav
    : adminNav

  const roleBadge = user.role === "shipper" ? "화주" : user.role === "driver" ? "기사" : "관리자"

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg">🚛</span>
            <span className="font-bold text-gray-900 text-base tracking-tight">화물로</span>
          </Link>
          <div className="hidden md:flex items-center gap-0.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">{user.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {roleBadge}
            </span>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-sm text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
