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

  const { data: setlistSongs } = await supabase
    .from("setlist_songs")
    .select(`
      position,
      is_offering,
      songs(id, name, artist, key, lyrics, youtube_link, created_by)
    `)
    .eq("setlist_id", id)
    .order("position")

  const creatorIds = setlistSongs?.map((item: any) => item.songs.created_by).filter(Boolean) || []
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

  // Combinar canciones con sus creadores
  const songsWithCreators = setlistSongs?.map((item: any) => ({
    ...item,
    songs: {
      ...item.songs,
      creator: creatorsMap[item.songs.created_by] || null,
    },
  }))

  return (
    <div className="container mx-auto py-8 px-4">
      <SetlistDetail setlist={setlist} songs={songsWithCreators || []} />
    </div>
  )
}
