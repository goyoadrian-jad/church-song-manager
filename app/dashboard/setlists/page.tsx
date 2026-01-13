import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { SetlistsPageClient } from "@/components/setlists/setlists-page-client"

export default async function SetlistsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()

  if (!profile) {
    redirect("/dashboard")
  }

  // Get future setlists with leader info
  const today = new Date().toISOString().split("T")[0]
  const { data: setlists } = await supabase
    .from("setlists")
    .select(`
      *,
      leader:profiles!setlists_leader_id_fkey(first_name, last_name)
    `)
    .gte("date", today)
    .order("date", { ascending: true })

  return (
    <>
      <DashboardHeader profile={profile} />
      <SetlistsPageClient setlists={setlists || []} profile={profile} />
    </>
  )
}
