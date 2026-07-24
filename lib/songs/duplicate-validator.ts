// Utilidades para detectar canciones duplicadas

/**
 * Normaliza un texto para comparación:
 * - Convierte a minúsculas
 * - Elimina acentos
 * - Elimina caracteres especiales excepto letras y números
 * - Elimina espacios múltiples
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Solo letras, números y espacios
    .replace(/\s+/g, ' ') // Espacios múltiples a uno
    .trim()
}

/**
 * Divide la letra en versos (líneas no vacías)
 */
function getVerses(lyrics: string): string[] {
  return lyrics
    .split('\n')
    .map(line => normalizeText(line))
    .filter(line => line.length > 0)
}

/**
 * Calcula la similitud entre dos strings usando el algoritmo de Levenshtein
 * Retorna un valor entre 0 y 1 (1 = idénticos)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1)
  const s2 = normalizeText(str2)

  if (s1 === s2) return 1
  if (s1.length === 0 || s2.length === 0) return 0

  const len1 = s1.length
  const len2 = s2.length

  // Matriz para Levenshtein
  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // Eliminación
        matrix[i][j - 1] + 1,     // Inserción
        matrix[i - 1][j - 1] + cost // Sustitución
      )
    }
  }

  const distance = matrix[len1][len2]
  const maxLen = Math.max(len1, len2)
  return 1 - distance / maxLen
}

/**
 * Compara dos letras de canciones verso a verso
 * Retorna el porcentaje de versos similares
 */
function compareLyrics(lyrics1: string, lyrics2: string): number {
  const verses1 = getVerses(lyrics1)
  const verses2 = getVerses(lyrics2)

  if (verses1.length === 0 || verses2.length === 0) return 0

  let matchingVerses = 0
  const usedIndexes = new Set<number>()

  for (const verse1 of verses1) {
    let bestMatch = 0
    let bestIndex = -1

    for (let i = 0; i < verses2.length; i++) {
      if (usedIndexes.has(i)) continue
      
      const similarity = calculateSimilarity(verse1, verses2[i])
      if (similarity > bestMatch) {
        bestMatch = similarity
        bestIndex = i
      }
    }

    // Consideramos un verso como match si tiene >80% similitud
    if (bestMatch > 0.8 && bestIndex !== -1) {
      matchingVerses++
      usedIndexes.add(bestIndex)
    }
  }

  // Porcentaje de versos que coinciden
  const totalVerses = Math.max(verses1.length, verses2.length)
  return matchingVerses / totalVerses
}

export interface DuplicateCandidate {
  id: string
  name: string
  artist: string
  titleSimilarity: number
  lyricsSimilarity: number
  sameType: boolean
  sameYoutubeLink: boolean
  overallScore: number
  reason: string
}

interface SongData {
  id: string
  name: string
  artist: string
  lyrics: string
  song_type_id?: string | null
  youtube_link?: string | null
}

/**
 * Busca posibles duplicados de una canción
 */
export function findDuplicates(
  newSong: {
    name: string
    lyrics: string
    song_type_id?: string | null
    youtube_link?: string | null
  },
  existingSongs: SongData[],
  excludeId?: string // Para excluir la canción actual al editar
): DuplicateCandidate[] {
  const candidates: DuplicateCandidate[] = []

  for (const song of existingSongs) {
    // Excluir la canción actual si estamos editando
    if (excludeId && song.id === excludeId) continue

    const titleSimilarity = calculateSimilarity(newSong.name, song.name)
    const lyricsSimilarity = compareLyrics(newSong.lyrics, song.lyrics)
    const sameType = !!(newSong.song_type_id && song.song_type_id && newSong.song_type_id === song.song_type_id)
    const sameYoutubeLink = !!(
      newSong.youtube_link && 
      song.youtube_link && 
      extractYoutubeId(newSong.youtube_link) === extractYoutubeId(song.youtube_link)
    )

    // Calcular puntuación general
    let overallScore = 0
    const reasons: string[] = []

    // El título similar es importante
    if (titleSimilarity > 0.8) {
      overallScore += titleSimilarity * 0.3
      reasons.push(`Título muy similar (${Math.round(titleSimilarity * 100)}%)`)
    } else if (titleSimilarity > 0.6) {
      overallScore += titleSimilarity * 0.2
      reasons.push(`Título similar (${Math.round(titleSimilarity * 100)}%)`)
    }

    // La letra es el factor más importante
    if (lyricsSimilarity > 0.7) {
      overallScore += lyricsSimilarity * 0.5
      reasons.push(`Letra muy similar (${Math.round(lyricsSimilarity * 100)}% de versos coinciden)`)
    } else if (lyricsSimilarity > 0.4) {
      overallScore += lyricsSimilarity * 0.3
      reasons.push(`Parte de la letra coincide (${Math.round(lyricsSimilarity * 100)}%)`)
    }

    // Mismo tipo de canción
    if (sameType) {
      overallScore += 0.1
      reasons.push('Mismo tipo de canción')
    }

    // Mismo link de YouTube es muy indicativo
    if (sameYoutubeLink) {
      overallScore += 0.3
      reasons.push('Mismo link de YouTube')
    }

    // Solo reportar si hay suficiente evidencia
    if (overallScore > 0.3 || lyricsSimilarity > 0.5 || sameYoutubeLink) {
      candidates.push({
        id: song.id,
        name: song.name,
        artist: song.artist,
        titleSimilarity,
        lyricsSimilarity,
        sameType,
        sameYoutubeLink,
        overallScore,
        reason: reasons.join('. ')
      })
    }
  }

  // Ordenar por puntuación descendente
  return candidates.sort((a, b) => b.overallScore - a.overallScore)
}

/**
 * Extrae el ID de un video de YouTube de diferentes formatos de URL
 */
function extractYoutubeId(url: string): string | null {
  if (!url) return null
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}
