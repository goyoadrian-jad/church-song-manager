"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Music2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
        ? `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL}/auth/reset-password`
        : `${window.location.origin}/auth/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) throw error

      setResetEmailSent(true)
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al enviar el correo")
    } finally {
      setIsLoading(false)
    }
  }

  if (resetEmailSent) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted/20">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Correo Enviado</CardTitle>
              <CardDescription>Revisa tu bandeja de entrada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Hemos enviado un enlace a <strong>{email}</strong> para restablecer tu contraseña.
              </p>
              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={() => {
                  setIsResetMode(false)
                  setResetEmailSent(false)
                  setEmail("")
                }}
              >
                Volver al inicio de sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <Music2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Repertorio Iglesia</h1>
            </div>
            <p className="text-sm text-muted-foreground">Gestiona el repertorio musical de tu congregación</p>
          </div>
          <Card>
            <CardHeader>
              {isResetMode ? (
                <>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsResetMode(false)} className="h-8 w-8">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-xl">Recuperar Contraseña</CardTitle>
                  </div>
                  <CardDescription>Ingresa tu correo para recibir un enlace de recuperación</CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
                  <CardDescription>Ingresa tu correo y contraseña</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {isResetMode ? (
                <form onSubmit={handleResetPassword}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                    <Button type="button" variant="link" className="text-sm" onClick={() => setIsResetMode(true)}>
                      ¿Olvidaste tu contraseña?
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
