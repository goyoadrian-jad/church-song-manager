"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Save, Music, AlertTriangle } from "lucide-react"
import { getAvailableChords, isValidChord, analyzeChords } from "@/lib/music/chord-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"

interface ChordPosition {
  id?: string
  chord: string
  lineIndex: number
  charPosition: number
}

interface ChordEditorProps {
  songId: string
  lyrics: string
  originalKey: string
  initialChords: ChordPosition[]
  canEdit: boolean
  onSave?: () => void
}

export function ChordEditor({ 
  songId, 
  lyrics, 
  originalKey, 
  initialChords, 
  canEdit,
  onSave 
}: ChordEditorProps) {
  const [chords, setChords] = useState<ChordPosition[]>(initialChords)
  const [selectedPosition, setSelectedPosition] = useState<{ lineIndex: number; charPosition: number } | null>(null)
  const [selectedChord, setSelectedChord] = useState<string>("")
  const [customChord, setCustomChord] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const lines = lyrics.split('\n')
  const availableChords = getAvailableChords()
  
  // Analizar acordes fuera de escala
  const scaleWarnings = originalKey 
    ? analyzeChords(chords.map(c => c.chord), originalKey)
    : []

  const getChordAtPosition = useCallback((lineIndex: number, charPosition: number) => {
    return chords.find(c => c.lineIndex === lineIndex && c.charPosition === charPosition)
  }, [chords])

  const handleCharClick = (lineIndex: number, charPosition: number) => {
    if (!canEdit) return
    
    const existingChord = getChordAtPosition(lineIndex, charPosition)
    if (existingChord) {
      // Si ya existe un acorde, lo eliminamos
      setChords(chords.filter(c => !(c.lineIndex === lineIndex && c.charPosition === charPosition)))
    } else {
      // Abrir popover para agregar acorde
      setSelectedPosition({ lineIndex, charPosition })
      setSelectedChord("")
      setCustomChord("")
      setPopoverOpen(true)
    }
  }

  const handleAddChord = () => {
    if (!selectedPosition) return
    
    const chordToAdd = customChord || selectedChord
    if (!chordToAdd) {
      toast({ title: "Error", description: "Seleccioná o escribí un acorde", variant: "destructive" })
      return
    }

    if (!isValidChord(chordToAdd)) {
      toast({ title: "Error", description: "El acorde no es válido", variant: "destructive" })
      return
    }

    const newChord: ChordPosition = {
      chord: chordToAdd,
      lineIndex: selectedPosition.lineIndex,
      charPosition: selectedPosition.charPosition
    }

    setChords([...chords, newChord])
    setSelectedPosition(null)
    setSelectedChord("")
    setCustomChord("")
    setPopoverOpen(false)
  }

  const handleSaveChords = async () => {
    setIsSaving(true)
    try {
      // Eliminar acordes existentes de esta canción
      const { error: deleteError } = await supabase
        .from('song_chords')
        .delete()
        .eq('song_id', songId)

      if (deleteError) throw deleteError

      // Insertar nuevos acordes
      if (chords.length > 0) {
        const chordsToInsert = chords.map(c => ({
          song_id: songId,
          chord: c.chord,
          line_index: c.lineIndex,
          char_position: c.charPosition
        }))

        const { error: insertError } = await supabase
          .from('song_chords')
          .insert(chordsToInsert)

        if (insertError) throw insertError
      }

      toast({ title: "Acordes guardados", description: "Los acordes se guardaron correctamente" })
      onSave?.()
    } catch (error) {
      console.error('[v0] Error saving chords:', error)
      toast({ title: "Error", description: "No se pudieron guardar los acordes", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const renderLine = (line: string, lineIndex: number) => {
    // Obtener acordes de esta línea ordenados por posición
    const lineChords = chords
      .filter(c => c.lineIndex === lineIndex)
      .sort((a, b) => a.charPosition - b.charPosition)

    return (
      <div key={lineIndex} className="relative group">
        {/* Línea de acordes */}
        <div className="h-6 relative text-primary font-mono text-sm font-bold">
          {lineChords.map((chord, idx) => (
            <span
              key={idx}
              className="absolute cursor-pointer hover:text-destructive transition-colors"
              style={{ left: `${chord.charPosition * 0.6}em` }}
              onClick={(e) => {
                e.stopPropagation()
                if (canEdit) {
                  setChords(chords.filter(c => !(c.lineIndex === chord.lineIndex && c.charPosition === chord.charPosition)))
                }
              }}
              title={canEdit ? "Click para eliminar" : ""}
            >
              {chord.chord}
            </span>
          ))}
        </div>
        
        {/* Línea de letra */}
        <div className="font-mono text-sm whitespace-pre relative">
          {line.split('').map((char, charIndex) => {
            const hasChord = getChordAtPosition(lineIndex, charIndex)
            return (
              <span
                key={charIndex}
                className={`
                  ${canEdit ? 'cursor-pointer hover:bg-primary/20' : ''}
                  ${hasChord ? 'bg-primary/10 border-t-2 border-primary' : ''}
                  transition-colors
                `}
                onClick={() => {
                  if (!canEdit) return
                  if (!hasChord) {
                    setSelectedPosition({ lineIndex, charPosition: charIndex })
                    setSelectedChord("")
                    setCustomChord("")
                    setPopoverOpen(true)
                  }
                }}
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Editor de Acordes
          {originalKey && (
            <span className="text-sm font-normal text-muted-foreground">
              (Tonalidad original: {originalKey})
            </span>
          )}
        </CardTitle>
        {canEdit && (
          <Button onClick={handleSaveChords} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar Acordes"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {canEdit && (
          <p className="text-sm text-muted-foreground mb-4">
            Hacé click en cualquier letra para agregar un acorde. Click en un acorde existente para eliminarlo.
          </p>
        )}
        
        {/* Advertencias de acordes fuera de escala */}
        {scaleWarnings.length > 0 && (
          <Alert variant="default" className="mb-4 border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-600">Acordes fuera de la escala de {originalKey}</AlertTitle>
            <AlertDescription className="text-amber-600/80">
              <ul className="list-disc list-inside mt-2 space-y-1">
                {scaleWarnings.map((w, idx) => (
                  <li key={idx}>
                    <strong>{w.chord}</strong>: {w.warning}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm italic">
                Esto es solo una advertencia. Podés guardar los acordes de todas formas.
              </p>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Popover global para agregar acordes */}
        <Popover 
          open={popoverOpen} 
          onOpenChange={(open) => {
            setPopoverOpen(open)
            if (!open) setSelectedPosition(null)
          }}
        >
          <PopoverTrigger asChild>
            <span className="hidden" />
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="start" side="top">
            <div className="space-y-4">
              <div className="text-sm font-medium">
                Agregar acorde en posición seleccionada
              </div>
              <div className="space-y-2">
                <Label>Seleccionar acorde</Label>
                <Select value={selectedChord} onValueChange={(v) => { setSelectedChord(v); setCustomChord(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elegir acorde..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableChords.map((chord) => (
                      <SelectItem key={chord} value={chord}>
                        {chord}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>O escribir acorde personalizado</Label>
                <Input
                  placeholder="Ej: Cmaj7, Dsus4..."
                  value={customChord}
                  onChange={(e) => { setCustomChord(e.target.value); setSelectedChord(""); }}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddChord} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
                <Button variant="outline" onClick={() => setPopoverOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
          <div className="space-y-1">
            {lines.map((line, lineIndex) => renderLine(line, lineIndex))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
