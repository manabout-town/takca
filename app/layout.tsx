import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister"
import { PwaInstallBanner } from "@/components/shared/PwaInstallBanner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "화물로 - 화물 중개 플랫폼",
  description: "화주와 기사를 직접 연결하는 디지털 화물 중개 플랫폼",
  keywords: ["화물", "중개", "운송", "트럭", "배송"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "화물로",
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
