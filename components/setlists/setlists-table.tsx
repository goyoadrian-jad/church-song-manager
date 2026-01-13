"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface SetlistsTableProps {
  setlists: any[]
  canEdit: boolean
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
                <TableCell>{format(new Date(setlist.date), "dd/MM/yyyy", { locale: es })}</TableCell>
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
