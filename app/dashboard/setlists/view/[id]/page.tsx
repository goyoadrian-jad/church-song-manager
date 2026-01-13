import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SetlistDetail from "@/components/setlists/setlist-detail"

export default async function ViewSetlistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Obtener el setlist con el perfil del líder
  const { data: setlist } = await supabase
    .from("setlists")
    .select(`
      *,
      profiles!setlists_leader_id_fkey(first_name, last_name)
    `)
    .eq("id", id)
    .single()

  if (!setlist) {
    redirect("/dashboard/setlists")
  }

  // Obtener las canciones del setlist con detalles completos
  const { data: setlistSongs } = await supabase
    .from("setlist_songs")
    .select(`
      position,
      songs(id, name, artist, key, lyrics, youtube_link)
    `)
    .eq("setlist_id", id)
    .order("position")

  return (
    <div className="container mx-auto py-8 px-4">
      <SetlistDetail setlist={setlist} songs={setlistSongs || []} />
    </div>
  )
}
