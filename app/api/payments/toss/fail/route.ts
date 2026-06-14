import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get("code")
  const message = searchParams.get("message")
  return NextResponse.redirect(
    new URL(`/payment/fail?code=${code}&message=${encodeURIComponent(message || "")}`, req.url)
  )
}
