import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Music2 } from "lucide-react"
import Link from "next/link"

export default async function ViewSongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get song with relations
  const { data: song } = await supabase
    .from("songs")
    .select(
      `
      *,
      song_types (
        id,
        name
      ),
      users!songs_created_by_fkey (
        first_name,
        last_name
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!song) {
    redirect("/dashboard/songs")
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lyrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music2 className="h-5 w-5" />
                  Letra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{song.lyrics}</div>
              </CardContent>
            </Card>
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
