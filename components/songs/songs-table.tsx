"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Song {
  id: string
  name: string
  artist: string
  key: string
  youtube_link: string | null
  song_types: {
    id: string
    name: string
  } | null
  created_at: string
}

interface SongsTableProps {
  songs: Song[]
  canManage: boolean
}

export function SongsTable({ songs, canManage }: SongsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteSongId, setDeleteSongId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteSongId) return

    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("songs").delete().eq("id", deleteSongId)

      if (error) throw error

      toast({
        title: "✓ Canción eliminada",
        description: "La canción ha sido eliminada exitosamente",
      })

      setDeleteSongId(null)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting song:", error)
      toast({
        title: "✕ Error",
        description: "Error al eliminar la canción",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Artista</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Tonalidad</TableHead>
              <TableHead>YouTube</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay canciones registradas
                </TableCell>
              </TableRow>
            ) : (
              songs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className="font-medium">{song.name}</TableCell>
                  <TableCell className="text-muted-foreground">{song.artist}</TableCell>
                  <TableCell>
                    {song.song_types ? <Badge variant="outline">{song.song_types.name}</Badge> : <span>-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge>{song.key}</Badge>
                  </TableCell>
                  <TableCell>
                    {song.youtube_link ? (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={song.youtube_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/songs/view/${song.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {canManage && (
                        <>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/songs/edit/${song.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteSongId(song.id)}
                            className="hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteSongId} onOpenChange={(open) => !open && setDeleteSongId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta canción del repertorio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
