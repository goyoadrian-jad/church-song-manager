"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { findDuplicates, type DuplicateCandidate } from "@/lib/songs/duplicate-validator"
import { AlertTriangle } from "lucide-react"

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
  existingSongs?: Array<{
    id: string
    name: string
    artist: string
    lyrics: string
    song_type_id?: string | null
    youtube_link?: string | null
  }>
}

export function SongForm({ song, songTypes, userId, existingSongs = [] }: SongFormProps) {
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
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([])
  const [confirmDuplicate, setConfirmDuplicate] = useState(false)

  // Verificar duplicados cuando cambian los campos relevantes
  useEffect(() => {
    if (formData.name.length < 3 && formData.lyrics.length < 50) {
      setDuplicates([])
      return
    }

    const timer = setTimeout(() => {
      const found = findDuplicates(
        {
          name: formData.name,
          lyrics: formData.lyrics,
          song_type_id: formData.songTypeId || null,
          youtube_link: formData.youtubeLink || null,
        },
        existingSongs,
        song?.id // Excluir la canción actual si estamos editando
      )
      setDuplicates(found)
      setConfirmDuplicate(false) // Reset confirmación si cambian los datos
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.name, formData.lyrics, formData.songTypeId, formData.youtubeLink, existingSongs, song?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar si hay duplicados y no se ha confirmado
    if (duplicates.length > 0 && !confirmDuplicate) {
      toast({
        title: "Posibles duplicados encontrados",
        description: "Revisa las canciones similares abajo y confirma si deseas continuar",
        variant: "destructive",
      })
      return
    }

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
          title: "Canción actualizada",
          description: "La canción ha sido actualizada exitosamente",
        })
      } else {
        // Create new song
        const { error: insertError } = await supabase.from("songs").insert({
          ...songData,
          created_by: userId,
        })

        if (insertError) throw insertError

        toast({
          title: "Canción creada",
          description: "La canción ha sido creada exitosamente",
        })
      }

      setTimeout(() => {
        window.location.href = "/dashboard/songs"
      }, 1000)
    } catch (error: unknown) {
      console.error("[v0] Error saving song:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al guardar canción"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
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

          {/* Alerta de posibles duplicados */}
          {duplicates.length > 0 && (
            <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-600">Posibles canciones duplicadas encontradas</AlertTitle>
              <AlertDescription className="text-amber-600/80">
                <p className="mb-3">Se encontraron {duplicates.length} canción(es) similar(es) en el sistema:</p>
                <ul className="space-y-2 mb-4">
                  {duplicates.slice(0, 3).map((dup) => (
                    <li key={dup.id} className="p-2 bg-amber-500/10 rounded">
                      <strong>{dup.name}</strong> - {dup.artist}
                      <br />
                      <span className="text-sm">{dup.reason}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confirmDuplicate"
                    checked={confirmDuplicate}
                    onChange={(e) => setConfirmDuplicate(e.target.checked)}
                    className="rounded border-amber-500"
                  />
                  <label htmlFor="confirmDuplicate" className="text-sm cursor-pointer">
                    Confirmo que esta canción NO es un duplicado y deseo guardarla
                  </label>
                </div>
              </AlertDescription>
            </Alert>
          )}

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
