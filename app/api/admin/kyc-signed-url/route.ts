import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

// Admin-only signed URL proxy for private kyc-documents bucket.
// The kyc_submissions table stores getPublicUrl() results which don't work
// for private buckets — this endpoint extracts the storage path and generates
// a 1-hour signed URL, redirecting to it.
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const service = createServiceClient()
  const { data: userData } = await service
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!userData || userData.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const rawUrl = req.nextUrl.searchParams.get("url")
  if (!rawUrl) return NextResponse.json({ error: "Missing url param" }, { status: 400 })

  // Extract storage path from Supabase URL formats:
  //   .../object/public/kyc-documents/kyc/...
  //   .../object/sign/kyc-documents/kyc/...
  const match = rawUrl.match(/\/(?:object\/(?:public|sign)\/|render\/image\/public\/)kyc-documents\/(.+?)(?:\?|$)/)
  if (!match) {
    // Fallback: try extracting after "kyc-documents/"
    const fallback = rawUrl.match(/kyc-documents\/(.+?)(?:\?|$)/)
    if (!fallback) {
      return NextResponse.json({ error: "Cannot parse storage path from url" }, { status: 400 })
    }
    const { data, error } = await service.storage
      .from("kyc-documents")
      .createSignedUrl(decodeURIComponent(fallback[1]), 3600)
    if (error || !data) return NextResponse.json({ error: "Signed URL generation failed" }, { status: 500 })
    return NextResponse.redirect(data.signedUrl)
  }

  const storagePath = decodeURIComponent(match[1])
  const { data, error } = await service.storage
    .from("kyc-documents")
    .createSignedUrl(storagePath, 3600)

  if (error || !data) {
    console.error("[KYC signed-url] createSignedUrl failed:", error?.message, { storagePath })
    return NextResponse.json({ error: "Signed URL generation failed", detail: error?.message }, { status: 500 })
  }

  return NextResponse.redirect(data.signedUrl)
}
