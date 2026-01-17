import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { canCreateSong } from "@/lib/auth/permissions"
import SetlistForm from "@/components/setlists/setlist-form"

export default async function EditSetlistPage({
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

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

  if (!profile || !canCreateSong(profile.role)) {
    redirect("/dashboard")
  }

  // Obtener el setlist
  const { data: setlist } = await supabase.from("setlists").select("*").eq("id", id).single()

  if (!setlist) {
    redirect("/dashboard/setlists")
  }

  const { data: setlistSongs } = await supabase
    .from("setlist_songs")
    .select("song_id, position, is_offering")
    .eq("setlist_id", id)
    .order("position")

  const { data: songs } = await supabase
    .from("songs")
    .select("id, name, artist, key, lyrics, youtube_link, created_by")
    .order("name")

  const creatorIds = songs?.map((song) => song.created_by).filter(Boolean) || []
  const uniqueCreatorIds = [...new Set(creatorIds)]

  let creatorsMap: Record<string, any> = {}
  if (uniqueCreatorIds.length > 0) {
    const { data: creators } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", uniqueCreatorIds)

    creatorsMap =
      creators?.reduce((acc: any, creator: any) => {
        acc[creator.user_id] = creator
        return acc
      }, {}) || {}
  }

  const songsWithCreators =
    songs?.map((song) => ({
      ...song,
      creator: creatorsMap[song.created_by] || null,
    })) || []

  const offeringSongIds = setlistSongs?.filter((s) => s.is_offering).map((s) => s.song_id) || []

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Editar Lista de Canciones</h1>
      <SetlistForm
        songs={songsWithCreators}
        profile={profile}
        setlist={setlist}
        selectedSongIds={setlistSongs?.map((s) => s.song_id) || []}
        offeringSongIds={offeringSongIds}
      />
    </div>
  )
}
