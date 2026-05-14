"use client"

import { useRouter } from "next/navigation"
import { ChordEditor } from "@/components/songs/chord-editor"

interface ChordPosition {
  id?: string
  chord: string
  lineIndex: number
  charPosition: number
}

interface ChordEditorClientProps {
  songId: string
  lyrics: string
  originalKey: string
  initialChords: ChordPosition[]
  canEdit: boolean
}

export function ChordEditorClient({ 
  songId, 
  lyrics, 
  originalKey, 
  initialChords, 
  canEdit 
}: ChordEditorClientProps) {
  const router = useRouter()

  const handleSave = () => {
    router.refresh()
  }

  return (
    <ChordEditor
      songId={songId}
      lyrics={lyrics}
      originalKey={originalKey}
      initialChords={initialChords}
      canEdit={canEdit}
      onSave={handleSave}
    />
  )
}
