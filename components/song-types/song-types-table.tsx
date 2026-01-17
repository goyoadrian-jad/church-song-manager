"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
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
import { useToast } from "@/hooks/use-toast"

interface SongType {
  id: string
  name: string
  description: string | null
  created_at: string
}

interface SongTypesTableProps {
  songTypes: SongType[]
  canManage: boolean
}

export function SongTypesTable({ songTypes, canManage }: SongTypesTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTypeId) return

    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { data: songs, error: checkError } = await supabase
        .from("songs")
        .select("id")
        .eq("song_type_id", deleteTypeId)
        .limit(1)

      if (checkError) throw checkError

      if (songs && songs.length > 0) {
        toast({
          title: "No se puede eliminar",
          description: "Este tipo de canción está siendo usado por canciones existentes",
          variant: "destructive",
        })
        setDeleteTypeId(null)
        setIsDeleting(false)
        return
      }

      const { error } = await supabase.from("song_types").delete().eq("id", deleteTypeId)

      if (error) throw error

      toast({
        title: "Tipo eliminado",
        description: "El tipo de canción ha sido eliminado exitosamente",
      })

      setDeleteTypeId(null)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting song type:", error)
      toast({
        title: "Error",
        description: "Error al eliminar tipo de canción",
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
              <TableHead>Descripción</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              {canManage && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {songTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No hay tipos de canciones registrados
                </TableCell>
              </TableRow>
            ) : (
              songTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="text-muted-foreground">{type.description || "Sin descripción"}</TableCell>
                  <TableCell>{new Date(type.created_at).toLocaleDateString("es-ES")}</TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/song-types/edit/${type.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTypeId(type.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTypeId} onOpenChange={(open) => !open && setDeleteTypeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este tipo de canción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
