"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Verificar contraseña actual intentando hacer sign in
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user?.email) throw new Error("No se pudo obtener el usuario")

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        setError("La contraseña actual es incorrecta")
        setIsLoading(false)
        return
      }

      // Actualizar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente",
      })

      // Limpiar formulario
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al cambiar la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Contraseña Actual</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Nueva Contraseña</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Actualizando..." : "Cambiar Contraseña"}
      </Button>
    </form>
  )
}
