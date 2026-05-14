import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Edit, Music } from "lucide-react"
import Link from "next/link"
import { SongViewClient } from "@/components/songs/song-view-client"

export default async function ViewSongPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get song with relations
  const { data: song } = await supabase
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
    .eq("id", id)
    .single()

  if (!song) {
    redirect("/dashboard/songs")
  }

  // Get song chords
  const { data: chords } = await supabase
    .from("song_chords")
    .select("*")
    .eq("song_id", id)
    .order("line_index", { ascending: true })
    .order("char_position", { ascending: true })

  // Check if user can edit chords (creator or admin)
  const canEditChords = profile?.role === 'Admin' || song.created_by === user.id

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
            <Link href="/dashboard/songs">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{song.name}</h1>
            <p className="text-muted-foreground">{song.artist}</p>
          </div>
          {canEditChords && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/songs/${id}/chords`}>
                <Music className="h-4 w-4 mr-2" />
                Editar Acordes
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lyrics with Chords Viewer */}
            <SongViewClient 
              lyrics={song.lyrics} 
              originalKey={song.key} 
              chords={formattedChords}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  {song.song_types ? (
                    <Badge variant="outline" className="mt-1">
                      {song.song_types.name}
                    </Badge>
                  ) : (
                    <p className="text-sm">Sin tipo</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tonalidad</p>
                  <Badge className="mt-1">{song.key}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Artista</p>
                  <p className="text-sm font-medium">{song.artist}</p>
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle>Enlaces</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {song.youtube_link && (
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <a href={song.youtube_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      YouTube
                    </a>
                  </Button>
                )}
                {song.multitrack_link && (
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <a href={song.multitrack_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Multitrack
                    </a>
                  </Button>
                )}
                {song.chord_chart_link && (
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <a href={song.chord_chart_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Tonalidades
                    </a>
                  </Button>
                )}
                {!song.youtube_link && !song.multitrack_link && !song.chord_chart_link && (
                  <p className="text-sm text-muted-foreground text-center py-2">No hay enlaces disponibles</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
