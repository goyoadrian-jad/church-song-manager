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
import { useToast } from "@/hooks/use-toast"

interface SongTypeFormProps {
  songType?: {
    id: string
    name: string
    description: string | null
  }
}

export function SongTypeForm({ songType }: SongTypeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: songType?.name || "",
    description: songType?.description || "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (songType) {
        // Update existing song type
        const { error: updateError } = await supabase
          .from("song_types")
          .update({
            name: formData.name,
            description: formData.description || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", songType.id)

        if (updateError) throw updateError

        toast({
          title: "Tipo actualizado",
          description: "El tipo de canción se actualizó correctamente",
        })
      } else {
        // Create new song type
        const { error: insertError } = await supabase.from("song_types").insert({
          name: formData.name,
          description: formData.description || null,
        })

        if (insertError) throw insertError

        toast({
          title: "Tipo creado",
          description: "El tipo de canción se creó correctamente",
        })
      }

      setTimeout(() => {
        window.location.href = "/dashboard/song-types"
      }, 1000)
    } catch (error: unknown) {
      console.error("[v0] Error saving song type:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al guardar tipo de canción"
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
        <CardTitle>{songType ? "Editar Tipo" : "Nuevo Tipo"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Adoración, Congregacional, Especial"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe este tipo de canción..."
              rows={4}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : songType ? "Actualizar" : "Crear"}
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
