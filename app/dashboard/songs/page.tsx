import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import SongsPageClient from "@/components/songs/songs-page-client"

export default async function SongsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: currentProfile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

  // Get all songs with their song type
  const { data: songs } = await supabase
    .from("songs")
    .select(
      `
      *,
      song_types (
        id,
        name
      )
    `,
    )
    .order("created_at", { ascending: false })

  // Manually fetch profile data for each song creator
  const songsWithProfiles = await Promise.all(
    (songs || []).map(async (song) => {
      if (song.created_by) {
        const { data: creatorProfile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", song.created_by)
          .single()

        return {
          ...song,
          creator: creatorProfile || null,
        }
      }
      return {
        ...song,
        creator: null,
      }
    }),
  )

  // Get all song types for filter
  const { data: songTypes } = await supabase.from("song_types").select("id, name").order("name")

  const canCreate = currentProfile?.role === "Admin" || currentProfile?.role === "Editor"
  const canEdit = currentProfile?.role === "Admin"

  return (
    <div className="min-h-svh bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Repertorio de Canciones</h1>
            <p className="text-muted-foreground">Gestiona el repertorio musical completo</p>
          </div>
        </div>

        <SongsPageClient
          songs={songsWithProfiles || []}
          songTypes={songTypes || []}
          canCreate={canCreate}
          canEdit={canEdit}
        />
      </div>
    </div>
  )
}
