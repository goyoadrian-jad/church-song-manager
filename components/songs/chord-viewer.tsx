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
import { KEYS, transposeChord, getSemitonesBetweenKeys } from "@/lib/music/chord-utils"

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
  const [targetKey, setTargetKey] = useState<string>(originalKey || 'C')
  const [semitoneOffset, setSemitoneOffset] = useState<number>(0)

  const lines = lyrics.split('\n')

  // Calcular semitonos totales (desde tonalidad original + offset manual)
  const totalSemitones = useMemo(() => {
    if (!originalKey) return semitoneOffset
    const keySemitones = getSemitonesBetweenKeys(originalKey, targetKey)
    return keySemitones + semitoneOffset
  }, [originalKey, targetKey, semitoneOffset])

  // Transponer acordes
  const transposedChords = useMemo(() => {
    const useFlats = targetKey.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(targetKey)
    return chords.map(c => ({
      ...c,
      chord: transposeChord(c.chord, totalSemitones, useFlats)
    }))
  }, [chords, totalSemitones, targetKey])

  const handleKeyChange = (newKey: string) => {
    setTargetKey(newKey)
    setSemitoneOffset(0) // Reset offset cuando se cambia la tonalidad
  }

  const handleSemitoneChange = (delta: number) => {
    const newOffset = semitoneOffset + delta
    // Limitar a -12 / +12
    if (newOffset >= -12 && newOffset <= 12) {
      setSemitoneOffset(newOffset)
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
            <Select value={targetKey} onValueChange={handleKeyChange}>
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
                disabled={semitoneOffset <= -12}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-mono">
                {semitoneOffset >= 0 ? '+' : ''}{semitoneOffset}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleSemitoneChange(1)}
                disabled={semitoneOffset >= 12}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {originalKey && (
            <div className="text-sm text-muted-foreground">
              Original: <span className="font-bold">{originalKey}</span>
              {targetKey !== originalKey && (
                <span> → <span className="font-bold text-primary">{targetKey}</span></span>
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
