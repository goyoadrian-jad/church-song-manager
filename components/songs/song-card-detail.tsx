"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Eye, ExternalLink, Music, Gift } from "lucide-react"

interface SongCardDetailProps {
  song: {
    id: string
    name: string
    artist: string
    key?: string
    lyrics?: string
    youtube_link?: string
  }
  creator?: {
    first_name: string
    last_name: string
  }
  position?: number
  showPosition?: boolean
  isOffering?: boolean
}

export function SongCardDetail({
  song,
  creator,
  position,
  showPosition = false,
  isOffering = false,
}: SongCardDetailProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {showPosition && position !== undefined && (
            <span className="font-bold text-2xl text-muted-foreground w-8 flex-shrink-0">{position}</span>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">{song.name}</h3>
              {isOffering && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                >
                  <Gift className="h-3 w-3 mr-1" />
                  Ofrenda
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{song.artist}</p>

            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              {song.key && (
                <div className="flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  <span className="font-medium">{song.key}</span>
                </div>
              )}

              {creator && (
                <span className="text-muted-foreground">
                  Líder: {creator.first_name} {creator.last_name}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {/* Botón para ver letra */}
            {song.lyrics && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="Ver letra">
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{song.name}</DialogTitle>
                    <DialogDescription>{song.artist}</DialogDescription>
                  </DialogHeader>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{song.lyrics}</div>
                </DialogContent>
              </Dialog>
            )}

            {/* Botón para ver en YouTube */}
            {song.youtube_link && (
              <Button variant="outline" size="icon" asChild title="Ver en YouTube">
                <a href={song.youtube_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
