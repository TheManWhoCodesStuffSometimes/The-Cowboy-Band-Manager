// types/dj.ts
export interface SongRequest {
  id: string // "artist-title"
  title: string
  artist: string
  requestCount: number
  createdAt?: string
}

export interface CooldownSong {
  id: string // "artist-title"
  title: string
  artist: string
  cooldownUntil: number // Timestamp
  playedAt?: string
}

export interface BlacklistedSong {
  id: string // "artist-title"
  title: string
  artist: string
  addedAt?: string
}

export interface MusicBrainzSong {
  id: string // MBID from MusicBrainz
  title: string
  artist: string
}

// API Response types
export interface DjApiResponse<T> {
  success: boolean
  data: T[]
  message?: string
  lastUpdated?: string
}
