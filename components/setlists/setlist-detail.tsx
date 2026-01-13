"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, Clock, Eye } from "lucide-react"
import Link from "next/link"

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
            {songs.map((item, index) => {
              const song = item.songs
              return (
                <div
                  key={item.position}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="font-bold text-2xl text-muted-foreground w-8">{index + 1}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{song.name}</h3>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                    {song.key && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Tonalidad: <span className="font-medium">{song.key}</span>
                      </p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="icon">
                    <Link href={`/dashboard/songs/view/${song.id}`} target="_blank">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
