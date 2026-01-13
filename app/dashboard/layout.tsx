import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/layout/dashboard-header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <div className="pt-4">{children}</div>
    </div>
  )
}
