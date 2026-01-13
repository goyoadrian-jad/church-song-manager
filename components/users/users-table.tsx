"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RoleBadge } from "@/components/ui/role-badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { deleteUser } from "@/app/actions/delete-user"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  created_at: string
}

interface UsersTableProps {
  users: User[]
  isAdmin: boolean
  currentUserId: string
}

export function UsersTable({ users, isAdmin, currentUserId }: UsersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteUserId) return

    setIsDeleting(true)

    try {
      const result = await deleteUser(deleteUserId)

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else {
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado exitosamente",
        })
        setDeleteUserId(null)
        router.refresh()
      }
    } catch (error) {
      console.error("[v0] Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar usuario",
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
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role as "Admin" | "Lider" | "Multimedia"} />
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString("es-ES")}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/users/edit/${user.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {user.id !== currentUserId && (
                          <Button variant="ghost" size="icon" onClick={() => setDeleteUserId(user.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario y todos sus datos asociados.
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
