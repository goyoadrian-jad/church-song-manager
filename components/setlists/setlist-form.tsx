"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { X, GripVertical, Eye, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Song {
  id: string
  name: string
  artist: string
  key?: string
  lyrics?: string
  youtube_link?: string
  creator?: {
    first_name: string
    last_name: string
  }
}

interface SetlistFormProps {
  songs: Song[]
  profile: any
  setlist?: any
  selectedSongIds?: string[]
}

export default function SetlistForm({ songs, profile, setlist, selectedSongIds = [] }: SetlistFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: setlist?.name || "",
    date: setlist?.date || "",
    service_type: setlist?.service_type || "",
    notes: setlist?.notes || "",
  })

  const [selectedSongs, setSelectedSongs] = useState<string[]>(selectedSongIds)
  const [searchTerm, setSearchTerm] = useState("")

  const availableSongs = songs.filter((song) => !selectedSongs.includes(song.id))

  const filteredSongs = availableSongs.filter(
    (song) =>
      song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleToggleSong = (songId: string) => {
    setSelectedSongs((prev) => (prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]))
  }

  const moveSong = (index: number, direction: "up" | "down") => {
    const newSongs = [...selectedSongs]
    const newIndex = direction === "up" ? index - 1 : index + 1

    if (newIndex >= 0 && newIndex < newSongs.length) {
      ;[newSongs[index], newSongs[newIndex]] = [newSongs[newIndex], newSongs[index]]
      setSelectedSongs(newSongs)
    }
  }

  const removeSong = (songId: string) => {
    setSelectedSongs((prev) => prev.filter((id) => id !== songId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createBrowserClient()

      if (!formData.name || !formData.date || !formData.service_type) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos requeridos",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (selectedSongs.length === 0) {
        toast({
          title: "Error",
          description: "Debes seleccionar al menos una canción",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      let setlistId = setlist?.id

      if (setlist) {
        // Actualizar setlist existente
        const { error: updateError } = await supabase
          .from("setlists")
          .update({
            name: formData.name,
            date: formData.date,
            service_type: formData.service_type,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", setlist.id)

        if (updateError) throw updateError

        // Eliminar canciones antiguas
        await supabase.from("setlist_songs").delete().eq("setlist_id", setlist.id)
      } else {
        // Crear nuevo setlist
        const { data: newSetlist, error: createError } = await supabase
          .from("setlists")
          .insert({
            name: formData.name,
            leader_id: profile.user_id,
            date: formData.date,
            service_type: formData.service_type,
            notes: formData.notes,
          })
          .select()
          .single()

        if (createError) throw createError
        setlistId = newSetlist.id
      }

      // Insertar canciones en el orden especificado
      const setlistSongsData = selectedSongs.map((songId, index) => ({
        setlist_id: setlistId,
        song_id: songId,
        position: index + 1,
      }))

      const { error: songsError } = await supabase.from("setlist_songs").insert(setlistSongsData)

      if (songsError) throw songsError

      toast({
        title: "Éxito",
        description: `Lista ${setlist ? "actualizada" : "creada"} correctamente`,
      })

      setTimeout(() => {
        window.location.href = "/dashboard/setlists"
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Error saving setlist:", error)
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al guardar la lista",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const getSelectedSongDetails = () => {
    return selectedSongs.map((id) => songs.find((s) => s.id === id)).filter(Boolean) as Song[]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la Lista *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Reunión de Alabanza"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Fecha *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service_type">Reunión *</Label>
          <Select
            value={formData.service_type}
            onValueChange={(value) => setFormData({ ...formData, service_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una reunión" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Miércoles">Miércoles</SelectItem>
              <SelectItem value="Domingo AM">Domingo AM</SelectItem>
              <SelectItem value="Domingo PM">Domingo PM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionales sobre la lista..."
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Canciones Seleccionadas ({selectedSongs.length})</Label>
        {selectedSongs.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                {getSelectedSongDetails().map((song, index) => (
                  <div key={song.id} className="flex items-start gap-3 p-4 bg-muted rounded-lg border">
                    <span className="font-bold text-lg w-8 mt-1">{index + 1}.</span>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-semibold text-lg">{song.name}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {song.key && (
                          <span className="flex items-center gap-1">
                            <strong>Tonalidad:</strong> {song.key}
                          </span>
                        )}
                        {song.creator && (
                          <span className="flex items-center gap-1">
                            <strong>Líder:</strong> {song.creator.first_name} {song.creator.last_name}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {song.lyrics && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver Letra
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{song.name}</DialogTitle>
                              </DialogHeader>
                              <div className="whitespace-pre-wrap text-sm">{song.lyrics}</div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {song.youtube_link && (
                          <Button type="button" variant="outline" size="sm" asChild>
                            <a href={song.youtube_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              YouTube
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSong(index, "up")}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-4 w-4 rotate-90" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSong(index, "down")}
                        disabled={index === selectedSongs.length - 1}
                      >
                        <GripVertical className="h-4 w-4 -rotate-90" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeSong(song.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <Label>Seleccionar Canciones ({availableSongs.length} disponibles)</Label>
        <Input placeholder="Buscar canciones..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Card className="max-h-96 overflow-y-auto">
          <CardContent className="p-4">
            <div className="space-y-2">
              {filteredSongs.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  {searchTerm ? "No se encontraron canciones" : "Todas las canciones están seleccionadas"}
                </p>
              ) : (
                filteredSongs.map((song) => (
                  <div key={song.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg">
                    <Checkbox
                      checked={selectedSongs.includes(song.id)}
                      onCheckedChange={() => handleToggleSong(song.id)}
                    />
                    <label
                      htmlFor={`song-${song.id}`}
                      className="flex-1 cursor-pointer"
                      onClick={() => handleToggleSong(song.id)}
                    >
                      <p className="font-medium">{song.name}</p>
                      <p className="text-sm text-muted-foreground">{song.artist}</p>
                    </label>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : setlist ? "Actualizar Lista" : "Crear Lista"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/setlists")}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
