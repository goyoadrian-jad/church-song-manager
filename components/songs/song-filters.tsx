"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface SongFiltersProps {
  onFilterChange: (filters: SongFilters) => void
  songTypes: Array<{ id: string; name: string }>
}

export interface SongFilters {
  search: string
  songTypeId: string
  key: string
}

const MUSIC_KEYS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
  "Cm",
  "C#m",
  "Dm",
  "D#m",
  "Em",
  "Fm",
  "F#m",
  "Gm",
  "G#m",
  "Am",
  "A#m",
  "Bm",
]

export function SongFilters({ onFilterChange, songTypes }: SongFiltersProps) {
  const [filters, setFilters] = useState<SongFilters>({
    search: "",
    songTypeId: "all",
    key: "all",
  })

  const handleFilterChange = (key: keyof SongFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters: SongFilters = {
      search: "",
      songTypeId: "all",
      key: "all",
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = filters.search || filters.songTypeId !== "all" || filters.key !== "all"

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Nombre, artista o letra..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="songType">Tipo de Canción</Label>
            <Select value={filters.songTypeId} onValueChange={(value) => handleFilterChange("songTypeId", value)}>
              <SelectTrigger id="songType">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {songTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">Tonalidad</Label>
            <Select value={filters.key} onValueChange={(value) => handleFilterChange("key", value)}>
              <SelectTrigger id="key">
                <SelectValue placeholder="Todas las tonalidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tonalidades</SelectItem>
                {MUSIC_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="opacity-0">Acción</Label>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
