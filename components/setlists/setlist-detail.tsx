"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, Clock } from "lucide-react"
import Link from "next/link"
import { SongCardDetail } from "@/components/songs/song-card-detail"

interface SetlistDetailProps {
  setlist: any
  songs: any[]
}

export default function SetlistDetail({ setlist, songs }: SetlistDetailProps) {
  const leaderName = setlist.profiles ? `${setlist.profiles.first_name} ${setlist.profiles.last_name}` : "Desconocido"

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{setlist.name}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Líder: {leaderName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(setlist.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{setlist.service_type}</span>
            </div>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/setlists">Volver al Listado</Link>
        </Button>
      </div>

      {setlist.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{setlist.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Canciones ({songs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {songs.map((item, index) => (
              <SongCardDetail
                key={item.position}
                song={item.songs}
                creator={item.songs.creator}
                position={index + 1}
                showPosition={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
