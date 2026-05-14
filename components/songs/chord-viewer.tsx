"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Music, Minus, Plus } from "lucide-react"
import { KEYS, transposeChord, getSemitonesBetweenKeys, transposeChordToKey } from "@/lib/music/chord-utils"

// Mapa de índices de notas para calcular tonalidad desde semitonos
const NOTE_INDEX_MAP: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11
}

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

interface ChordPosition {
  chord: string
  lineIndex: number
  charPosition: number
}

interface ChordViewerProps {
  lyrics: string
  originalKey: string
  chords: ChordPosition[]
}

export function ChordViewer({ lyrics, originalKey, chords }: ChordViewerProps) {
  // Usamos semitonos como estado principal para sincronizar ambos controles
  const [semitones, setSemitones] = useState<number>(0)

  const lines = lyrics.split('\n')

  // Calcular la tonalidad actual basada en los semitonos
  const currentKey = useMemo(() => {
    if (!originalKey) return 'C'
    const originalIndex = NOTE_INDEX_MAP[originalKey] ?? 0
    const useFlats = originalKey.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(originalKey)
    const notesArray = useFlats ? NOTES_FLAT : NOTES_SHARP
    const newIndex = ((originalIndex + semitones) % 12 + 12) % 12
    return notesArray[newIndex]
  }, [originalKey, semitones])

  // Transponer acordes
  const transposedChords = useMemo(() => {
    const useFlats = currentKey.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(currentKey)
    return chords.map(c => ({
      ...c,
      chord: transposeChord(c.chord, semitones, useFlats)
    }))
  }, [chords, semitones, currentKey])

  // Cuando se cambia la tonalidad desde el combo, calcular los semitonos
  const handleKeyChange = (newKey: string) => {
    if (!originalKey) {
      setSemitones(0)
      return
    }
    const newSemitones = getSemitonesBetweenKeys(originalKey, newKey)
    setSemitones(newSemitones)
  }

  // Cuando se cambian los semitonos con los botones
  const handleSemitoneChange = (delta: number) => {
    const newSemitones = semitones + delta
    // Limitar a -12 / +12
    if (newSemitones >= -12 && newSemitones <= 12) {
      setSemitones(newSemitones)
    }
  }

  const getChordAtPosition = (lineIndex: number, charPosition: number) => {
    return transposedChords.find(c => c.lineIndex === lineIndex && c.charPosition === charPosition)
  }

  const getLineChords = (lineIndex: number) => {
    return transposedChords
      .filter(c => c.lineIndex === lineIndex)
      .sort((a, b) => a.charPosition - b.charPosition)
  }

  const renderLine = (line: string, lineIndex: number) => {
    const lineChords = getLineChords(lineIndex)
    const hasChords = lineChords.length > 0

    return (
      <div key={lineIndex} className="relative">
        {/* Línea de acordes */}
        {hasChords && (
          <div className="h-6 relative text-primary font-mono text-sm font-bold">
            {lineChords.map((chord, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${chord.charPosition * 0.6}em` }}
              >
                {chord.chord}
              </span>
            ))}
          </div>
        )}
        
        {/* Línea de letra */}
        <div className="font-mono text-sm whitespace-pre">
          {line.split('').map((char, charIndex) => {
            const hasChord = getChordAtPosition(lineIndex, charIndex)
            return (
              <span
                key={charIndex}
                className={hasChord ? 'border-t-2 border-primary' : ''}
              >
                {char === ' ' ? ' ' : char === '_' ? ' ' : char}
              </span>
            )
          })}
          {line === '' && <span>&nbsp;</span>}
        </div>
      </div>
    )
  }

  if (chords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Letra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg">
            <pre className="font-mono text-sm whitespace-pre-wrap">{lyrics}</pre>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Esta canción aún no tiene acordes configurados.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Letra con Acordes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles de transposición */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tonalidad:</span>
            <Select value={currentKey} onValueChange={handleKeyChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Semitonos:</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleSemitoneChange(-1)}
                disabled={semitones <= -12}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-mono font-bold">
                {semitones >= 0 ? '+' : ''}{semitones}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleSemitoneChange(1)}
                disabled={semitones >= 12}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {originalKey && (
            <div className="text-sm text-muted-foreground">
              Original: <span className="font-bold">{originalKey}</span>
              {currentKey !== originalKey && (
                <span> → <span className="font-bold text-primary">{currentKey}</span></span>
              )}
              {semitones !== 0 && (
                <span className="ml-2">
                  ({semitones > 0 ? '+' : ''}{semitones} {Math.abs(semitones) === 1 ? 'semitono' : 'semitonos'})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Letra con acordes */}
        <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
          <div className="space-y-1">
            {lines.map((line, lineIndex) => renderLine(line, lineIndex))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
