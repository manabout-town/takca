"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/app/actions/auth"
import type { User } from "@/lib/types"

interface NavbarProps {
  user: User
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()

  const shipperNav = [
    { href: "/shipper/dashboard", label: "내 의뢰" },
    { href: "/shipper/orders/new", label: "의뢰 등록" },
    { href: "/shipper/mypage", label: "마이페이지" },
  ]
  const driverNav = [
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

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🚛</span>
            <span className="font-bold text-blue-700 text-lg">화물로</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {user.name}
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              user.role === "shipper" ? "bg-blue-100 text-blue-700"
              : user.role === "driver" ? "bg-green-100 text-green-700"
              : "bg-purple-100 text-purple-700"
            }`}>
              {user.role === "shipper" ? "화주" : user.role === "driver" ? "기사" : "관리자"}
            </span>
          </span>
          <form action={signOut}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
