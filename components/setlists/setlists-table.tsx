"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

interface SetlistsTableProps {
  setlists: any[]
  canEdit: boolean
}

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(dateString: string): string {
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function SetlistsTable({ setlists, canEdit }: SetlistsTableProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este setlist?")) return

    const supabase = createClient()
    const { error } = await supabase.from("setlists").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el setlist",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Setlist eliminado",
        description: "El setlist se eliminó correctamente",
      })
      router.refresh()
    }
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Reunión</TableHead>
            <TableHead>Líder</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {setlists.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No hay setlists programados
              </TableCell>
            </TableRow>
          ) : (
            setlists.map((setlist) => (
              <TableRow key={setlist.id}>
                <TableCell>{formatDate(setlist.date)}</TableCell>
                <TableCell>{setlist.service_type}</TableCell>
                <TableCell>
                  {setlist.leader?.first_name} {setlist.leader?.last_name}
                </TableCell>
                <TableCell className="font-medium">{setlist.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/setlists/view/${setlist.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/setlists/edit/${setlist.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(setlist.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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
  )
}
