// Utilidades para transposición de acordes

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

// Mapeo de notas equivalentes
const NOTE_MAP: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4, 'E#': 5,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0
}

// Tonalidades disponibles
export const KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
]

// Acordes básicos soportados
export const CHORD_TYPES = [
  '', 'm', '7', 'maj7', 'm7', 'sus4', 'sus2', 'add9', 'dim', 'aug'
]

// Genera lista de acordes disponibles
export function getAvailableChords(): string[] {
  const chords: string[] = []
  for (const note of NOTES) {
    for (const type of CHORD_TYPES) {
      chords.push(note + type)
    }
  }
  return chords
}

// Extrae la nota base de un acorde
function getChordRoot(chord: string): string {
  if (chord.length >= 2 && (chord[1] === '#' || chord[1] === 'b')) {
    return chord.substring(0, 2)
  }
  return chord[0]
}

// Extrae el tipo/sufijo de un acorde
function getChordSuffix(chord: string): string {
  const root = getChordRoot(chord)
  return chord.substring(root.length)
}

// Transpone un acorde por N semitonos
export function transposeChord(chord: string, semitones: number, useFlats: boolean = false): string {
  if (!chord || chord.trim() === '') return chord
  
  const root = getChordRoot(chord)
  const suffix = getChordSuffix(chord)
  
  const noteIndex = NOTE_MAP[root]
  if (noteIndex === undefined) return chord
  
  const newIndex = ((noteIndex + semitones) % 12 + 12) % 12
  const notesArray = useFlats ? NOTES_FLAT : NOTES
  
  return notesArray[newIndex] + suffix
}

// Calcula semitonos entre dos tonalidades
export function getSemitonesBetweenKeys(fromKey: string, toKey: string): number {
  const fromIndex = NOTE_MAP[fromKey]
  const toIndex = NOTE_MAP[toKey]
  
  if (fromIndex === undefined || toIndex === undefined) return 0
  
  return ((toIndex - fromIndex) % 12 + 12) % 12
}

// Transpone un acorde de una tonalidad a otra
export function transposeChordToKey(chord: string, originalKey: string, targetKey: string): string {
  const semitones = getSemitonesBetweenKeys(originalKey, targetKey)
  const useFlats = targetKey.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(targetKey)
  return transposeChord(chord, semitones, useFlats)
}

// Valida si es un acorde válido
export function isValidChord(chord: string): boolean {
  if (!chord || chord.trim() === '') return false
  const root = getChordRoot(chord)
  return NOTE_MAP[root] !== undefined
}
