// types/dj.ts - Updated for new unified data structure
export interface SongRequest {
  id: string // "artist-title" or record ID from Airtable
  songId?: string // Alternative ID field
  title: string
  artist: string
  requestCount?: number
  createdAt?: string
  createdTime?: string
}

export interface CooldownSong {
  id: string // Record ID from Airtable
  songId: string // "artist-title" format
  title: string
  artist: string
  cooldownUntil: string // ISO string timestamp from backend
  playedAt?: string
  createdTime?: string
}

export interface BlacklistedSong {
  id: string // Record ID from Airtable
  songId: string // "artist-title" format
  title: string
  artist: string
  addedAt?: string
  createdTime?: string
}

export interface MusicBrainzSong {
  id: string // MBID from MusicBrainz
  title: string
  artist: string
}

// New unified data structure from backend
export interface DjStats {
  totalRequests: number
  availableRequests: number
  blacklistedSongs: number
  songsOnCooldown: number
}

export interface UnifiedDjData {
  availableRequests: SongRequest[]
  blacklist: BlacklistedSong[]
  activeCooldown: CooldownSong[]
  stats: DjStats
}

// API Response types
export interface DjApiResponse<T> {
  success: boolean
  data: T
  message?: string
  lastUpdated?: string
}

// Response from the new unified endpoint
export interface UnifiedDjResponse {
  success: boolean
  data: UnifiedDjData[]
}

// Legacy response types (for backward compatibility)
export interface LegacyDjApiResponse<T> {
  success: boolean
  data: T[]
  message?: string
  lastUpdated?: string
}
