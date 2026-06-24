import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister"
import { PwaInstallBanner } from "@/components/shared/PwaInstallBanner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "탁카 (TakCa) - 전국 카 캐리어 탁송 중개 플랫폼",
  description: "딜러사·경매장·개인을 카 캐리어 기사와 직접 연결하는 차량 탁송 중개 플랫폼",
  keywords: ["카 캐리어", "차량 탁송", "탁카", "takca", "자동차 운반"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "탁카",
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f97316",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        {children}
        <ServiceWorkerRegister />
        <PwaInstallBanner />
      </body>
    </html>
  )
}
