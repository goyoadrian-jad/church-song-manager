"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const MUSIC_KEYS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
  "Cm",
  "C#m",
  "Dm",
  "D#m",
  "Em",
  "Fm",
  "F#m",
  "Gm",
  "G#m",
  "Am",
  "A#m",
  "Bm",
]

interface SongFormProps {
  song?: {
    id: string
    name: string
    artist: string
    youtube_link: string | null
    multitrack_link: string | null
    lyrics: string
    key: string
    chord_chart_link: string | null
    song_type_id: string | null
  }
  songTypes: Array<{
    id: string
    name: string
  }>
  userId: string
}

export function SongForm({ song, songTypes, userId }: SongFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: song?.name || "",
    artist: song?.artist || "",
    youtubeLink: song?.youtube_link || "",
    multitrackLink: song?.multitrack_link || "",
    lyrics: song?.lyrics || "",
    key: song?.key || "C",
    chordChartLink: song?.chord_chart_link || "",
    songTypeId: song?.song_type_id || "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const songData = {
        name: formData.name,
        artist: formData.artist,
        youtube_link: formData.youtubeLink || null,
        multitrack_link: formData.multitrackLink || null,
        lyrics: formData.lyrics,
        key: formData.key,
        chord_chart_link: formData.chordChartLink || null,
        song_type_id: formData.songTypeId || null,
        updated_at: new Date().toISOString(),
      }

      if (song) {
        // Update existing song
        const { error: updateError } = await supabase.from("songs").update(songData).eq("id", song.id)

        if (updateError) throw updateError

        toast({
          title: "✓ Canción actualizada",
          description: "La canción ha sido actualizada exitosamente",
        })

        // Esperar un momento para que se vea el toast antes de redirigir
        setTimeout(() => {
          router.push("/dashboard/songs")
          router.refresh()
        }, 500)
      } else {
        // Create new song
        const { error: insertError } = await supabase.from("songs").insert({
          ...songData,
          created_by: userId,
        })

        if (insertError) throw insertError

        toast({
          title: "✓ Canción creada",
          description: "La canción ha sido creada exitosamente",
        })

        // Esperar un momento para que se vea el toast antes de redirigir
        setTimeout(() => {
          router.push("/dashboard/songs")
          router.refresh()
        }, 500)
      }
    } catch (error: unknown) {
      console.error("[v0] Error saving song:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al guardar canción"
      setError(errorMessage)
      toast({
        title: "✕ Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{song ? "Editar Canción" : "Nueva Canción"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Canción</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Amazing Grace"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artista</Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                placeholder="Ej: Hillsong Worship"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key">Tonalidad</Label>
              <Select value={formData.key} onValueChange={(value) => setFormData({ ...formData, key: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSIC_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="songType">Tipo de Canción</Label>
              <Select
                value={formData.songTypeId}
                onValueChange={(value) => setFormData({ ...formData, songTypeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {songTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lyrics">Letra</Label>
            <Textarea
              id="lyrics"
              value={formData.lyrics}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
              placeholder="Escribe la letra completa de la canción..."
              rows={10}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtubeLink">Link de YouTube (opcional)</Label>
            <Input
              id="youtubeLink"
              type="url"
              value={formData.youtubeLink}
              onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="multitrackLink">Link de Multitrack (opcional)</Label>
            <Input
              id="multitrackLink"
              type="url"
              value={formData.multitrackLink}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  multitrackLink: e.target.value,
                })
              }
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chordChartLink">Link de Tonalidades (opcional)</Label>
            <Input
              id="chordChartLink"
              type="url"
              value={formData.chordChartLink}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  chordChartLink: e.target.value,
                })
              }
              placeholder="https://..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : song ? "Actualizar" : "Crear"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="bg-transparent"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
