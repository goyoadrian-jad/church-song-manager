import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SongForm } from "@/components/songs/song-form"

export default async function EditSongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single()

  if (profile?.role !== "Admin") {
    redirect("/dashboard/songs")
  }

  // Get song to edit
  const { data: song } = await supabase.from("songs").select("*").eq("id", id).single()

  if (!song) {
    redirect("/dashboard/songs")
  }

  // Get song types for the form
  const { data: songTypes } = await supabase.from("song_types").select("*").order("name")

  return (
    <div className="min-h-svh bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/songs">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Canción</h1>
            <p className="text-muted-foreground">Actualiza los datos de la canción</p>
          </div>
        </div>

        <SongForm song={song} songTypes={songTypes || []} userId={user.id} />
      </div>
    </div>
  )
}
