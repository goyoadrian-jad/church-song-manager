"use client"

import { ChordViewer } from "@/components/songs/chord-viewer"

interface ChordPosition {
  id?: string
  chord: string
  lineIndex: number
  charPosition: number
}

interface SongViewClientProps {
  lyrics: string
  originalKey: string
  chords: ChordPosition[]
}

export function SongViewClient({ lyrics, originalKey, chords }: SongViewClientProps) {
  return (
    <ChordViewer 
      lyrics={lyrics} 
      originalKey={originalKey} 
      chords={chords}
    />
  )
}
