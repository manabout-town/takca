"use server"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "화물로 - 화물 중개 플랫폼",
  description: "안전하고 신뢰할 수 있는 화물 중개 서비스",
  keywords: ["화물", "중개", "운송", "트럭", "배송"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
