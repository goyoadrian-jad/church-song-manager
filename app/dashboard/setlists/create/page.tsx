import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { canCreateSong } from "@/lib/auth/permissions"
import SetlistForm from "@/components/setlists/setlist-form"

export default async function CreateSetlistPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

  if (!profile || !canCreateSong(profile.role)) {
    redirect("/dashboard")
  }

  // Obtener todas las canciones disponibles
  const { data: songs } = await supabase.from("songs").select("id, name, artist").order("name")

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Crear Lista de Canciones</h1>
      <SetlistForm songs={songs || []} profile={profile} />
    </div>
  )
}
