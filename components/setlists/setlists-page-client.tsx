"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import Link from "next/link"
import { SetlistsTable } from "./setlists-table"
import { useState, useMemo } from "react"

interface SetlistsPageClientProps {
  setlists: any[]
  profile: {
    role: string
  }
}

export function SetlistsPageClient({ setlists, profile }: SetlistsPageClientProps) {
  const canCreate = profile.role === "Admin" || profile.role === "Editor y Creador"

  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrar y ordenar setlists según la opción seleccionada
  const filteredSetlists = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let filtered: any[]
    if (filter === "upcoming") {
      filtered = setlists.filter((s) => new Date(s.date) >= today)
    } else if (filter === "past") {
      filtered = setlists.filter((s) => new Date(s.date) < today)
    } else {
      filtered = [...setlists]
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()

      if (filter === "past") {
        // Para pasadas, mostrar las más recientes primero
        return dateB - dateA
      } else {
        // Para próximas y todas, mostrar las más cercanas primero
        return dateA - dateB
      }
    })

    return filtered
  }, [setlists, filter])

  // Calcular paginación
  const totalPages = Math.ceil(filteredSetlists.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSetlists = filteredSetlists.slice(startIndex, startIndex + itemsPerPage)

  // Resetear página al cambiar filtro
  const handleFilterChange = (value: "upcoming" | "past" | "all") => {
    setFilter(value)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Setlists</h1>
            <p className="text-muted-foreground">Listas de canciones por reunión</p>
          </div>
          {canCreate && (
            <Button asChild>
              <Link href="/dashboard/setlists/create">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Lista
              </Link>
            </Button>
          )}
        </div>

        <div className="mb-6">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filtrar reuniones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Reuniones Siguientes</SelectItem>
              <SelectItem value="past">Reuniones Pasadas</SelectItem>
              <SelectItem value="all">Todas las Reuniones</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <SetlistsTable setlists={paginatedSetlists} canEdit={canCreate} />

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
