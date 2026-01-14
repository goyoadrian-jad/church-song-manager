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

  const { data: songs } = await supabase
    .from("songs")
    .select("id, name, artist, key, lyrics, youtube_link, created_by")
    .order("name")

  // Obtener información de los creadores desde profiles
  const creatorIds = songs?.map((song) => song.created_by).filter(Boolean) || []
  const { data: creators } = await supabase
    .from("profiles")
    .select("user_id, first_name, last_name")
    .in("user_id", creatorIds)

  // Combinar la información
  const songsWithCreators = songs?.map((song) => ({
    ...song,
    creator: creators?.find((c) => c.user_id === song.created_by)
      ? {
          first_name: creators.find((c) => c.user_id === song.created_by)?.first_name || "",
          last_name: creators.find((c) => c.user_id === song.created_by)?.last_name || "",
        }
      : null,
  }))

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Crear Lista de Canciones</h1>
      <SetlistForm songs={songsWithCreators || []} profile={profile} />
    </div>
  )
}
