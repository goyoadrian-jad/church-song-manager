import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ChordEditorClient } from "@/components/songs/chord-editor-client"

export default async function EditChordsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get current user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // Get song
  const { data: song } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id)
    .single()

  if (!song) {
    redirect("/dashboard/songs")
  }

  // Check if user can edit chords (creator or admin)
  const canEditChords = profile?.role === 'Admin' || song.created_by === user.id

  if (!canEditChords) {
    redirect(`/dashboard/songs/view/${id}`)
  }

  // Get existing chords
  const { data: chords } = await supabase
    .from("song_chords")
    .select("*")
    .eq("song_id", id)
    .order("line_index", { ascending: true })
    .order("char_position", { ascending: true })

  const formattedChords = (chords || []).map(c => ({
    id: c.id,
    chord: c.chord,
    lineIndex: c.line_index,
    charPosition: c.char_position
  }))

  return (
    <div className="min-h-svh bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/songs/view/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{song.name}</h1>
            <p className="text-muted-foreground">
              {song.artist} - Tonalidad: {song.key}
            </p>
          </div>
        </div>

        <ChordEditorClient
          songId={id}
          lyrics={song.lyrics}
          originalKey={song.key}
          initialChords={formattedChords}
          canEdit={canEditChords}
        />
      </div>
    </div>
  )
}
