"use server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { UserRole } from "@/lib/types"

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const service = createServiceClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const role = formData.get("role") as UserRole
  const vehicleNumber = formData.get("vehicleNumber") as string
  const vehicleType = formData.get("vehicleType") as string

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }
  if (!data.user) return { error: "회원가입 실패" }

  // Insert user profile
  const { error: profileError } = await service
    .from("users")
    .insert({ id: data.user.id, email, name, phone, role, status: "active" })
  if (profileError) return { error: profileError.message }

  // Insert role-specific profile
  if (role === "driver") {
    await service.from("driver_profiles").insert({
      user_id: data.user.id,
      vehicle_number: vehicleNumber,
      vehicle_type: vehicleType,
      is_verified: false,
      rating_avg: 0,
      rating_count: 0,
    })
  } else if (role === "shipper") {
    await service.from("shipper_profiles").insert({ user_id: data.user.id })
  }

  redirect(role === "driver" ? "/driver/feed" : "/shipper/dashboard")
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인 실패" }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role
  if (role === "shipper") redirect("/shipper/dashboard")
  if (role === "driver") redirect("/driver/feed")
  if (role === "admin") redirect("/admin/dashboard")
  redirect("/")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
