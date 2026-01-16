"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SongFilters, type SongFilters as SongFiltersType } from "@/components/songs/song-filters"
import { SongsTable } from "@/components/songs/songs-table"

interface Song {
  id: string
  name: string
  artist: string
  lyrics: string
  key: string
  created_by?: string
  song_types?: { id: string; name: string } | null
  creator?: { first_name: string; last_name: string } | null
  [key: string]: any
}

interface SongsPageClientProps {
  songs: Song[]
  songTypes: Array<{ id: string; name: string }>
  leaders: Array<{ user_id: string; first_name: string; last_name: string }>
  canCreate: boolean
  canEdit: boolean
}

export default function SongsPageClient({ songs, songTypes, leaders, canCreate, canEdit }: SongsPageClientProps) {
  const [filters, setFilters] = useState<SongFiltersType>({
    search: "",
    songTypeId: "all",
    key: "all",
    leaderId: "all",
  })

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      // Search filter (name, artist, lyrics)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          song.name.toLowerCase().includes(searchLower) ||
          song.artist.toLowerCase().includes(searchLower) ||
          song.lyrics.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Song type filter
      if (filters.songTypeId !== "all") {
        if (song.song_types?.id !== filters.songTypeId) return false
      }

      // Key filter
      if (filters.key !== "all") {
        if (song.key !== filters.key) return false
      }

      if (filters.leaderId !== "all") {
        if (song.created_by !== filters.leaderId) return false
      }

      return true
    })
  }, [songs, filters])

  return (
    <>
      {/* Filters - Pasar leaders */}
      <SongFilters onFilterChange={setFilters} songTypes={songTypes} leaders={leaders} />

      {/* Songs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Lista de Canciones
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredSongs.length} {filteredSongs.length === 1 ? "canción" : "canciones"})
              </span>
            </CardTitle>
            {canCreate && (
              <Button asChild>
                <Link href="/dashboard/songs/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Canción
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <SongsTable songs={filteredSongs} canEdit={canEdit} />
        </CardContent>
      </Card>
    </>
  )
}
