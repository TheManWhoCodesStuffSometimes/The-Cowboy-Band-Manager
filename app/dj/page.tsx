// app/dj/page.tsx - Updated for new unified API response
'use client'

import { useState, useEffect, useCallback } from 'react'
import { SpeakerWaveIcon, ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import DjView from '@/components/dj/DjView'
import type { SongRequest, CooldownSong, BlacklistedSong } from '@/types/dj'

export default function DjDashboard() {
  const [songRequests, setSongRequests] = useState<SongRequest[]>([])
  const [cooldownSongs, setCooldownSongs] = useState<CooldownSong[]>([])
  const [blacklist, setBlacklist] = useState<BlacklistedSong[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [stats, setStats] = useState({
    totalRequests: 0,
    availableRequests: 0,
    blacklistedSongs: 0,
    songsOnCooldown: 0
  })
  const router = useRouter()

  const COOLDOWN_DURATION = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

  // Handle logout - now logs out of the entire app
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAppAuthenticated')
    }
    // Refresh the page to trigger the app-level login
    window.location.reload()
  }

  // Generate consistent song IDs
  const generateSongId = (title: string, artist: string) => {
    return `${artist.toLowerCase().trim().replace(/\s+/g, '-')}-${title.toLowerCase().trim().replace(/\s+/g, '-')}`
  }

  // Helper functions to filter out empty objects and validate data
  const filterValidRequests = (songs: any[]): SongRequest[] => {
    return songs.filter(song => 
      song && 
      typeof song === 'object' && 
      song.title && 
      song.artist && 
      song.title.trim() !== '' && 
      song.artist.trim() !== ''
    ).map(song => ({
      id: song.id || song.songId || generateSongId(song.title, song.artist),
      songId: song.songId || song.id,
      title: song.title,
      artist: song.artist,
      requestCount: song.requestCount || 1,
      createdAt: song.createdAt,
      createdTime: song.createdTime
    }))
  }

  const filterValidBlacklist = (songs: any[]): BlacklistedSong[] => {
    return songs.filter(song => 
      song && 
      typeof song === 'object' && 
      song.title && 
      song.artist && 
      song.title.trim() !== '' && 
      song.artist.trim() !== ''
    ).map(song => ({
      id: song.id || song.songId || generateSongId(song.title, song.artist),
      songId: song.songId || song.id || generateSongId(song.title, song.artist),
      title: song.title,
      artist: song.artist,
      addedAt: song.addedAt,
      createdTime: song.createdTime
    }))
  }

  const filterValidCooldown = (songs: any[]): CooldownSong[] => {
    return songs.filter(song => 
      song && 
      typeof song === 'object' && 
      song.title && 
      song.artist && 
      song.cooldownUntil &&
      song.title.trim() !== '' && 
      song.artist.trim() !== ''
    ).map(song => ({
      id: song.id || song.songId || generateSongId(song.title, song.artist),
      songId: song.songId || song.id || generateSongId(song.title, song.artist),
      title: song.title,
      artist: song.artist,
      cooldownUntil: song.cooldownUntil,
      playedAt: song.playedAt,
      createdTime: song.createdTime
    }))
  }

  // Fetch DJ data from new unified API
  const fetchDjData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Single API call to get all DJ data
      const response = await fetch('/api/dj/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'requests.get' })
      })

      const result = await response.json()

      if (result.success && result.data) {
        // The response is an array, so we take the first item
        const djData = Array.isArray(result.data) ? result.data[0] : result.data
        
        if (djData.success && djData.data) {
          // Filter out empty objects and validate data before setting state
          const validRequests = filterValidRequests(djData.data.availableRequests || [])
          const validBlacklist = filterValidBlacklist(djData.data.blacklist || [])
          const validCooldown = filterValidCooldown(djData.data.activeCooldown || [])
          
          // Update state with filtered valid data
          setSongRequests(validRequests)
          setBlacklist(validBlacklist)
          setCooldownSongs(validCooldown)
          
          // Update stats but use actual filtered counts instead of backend stats
          setStats({
            totalRequests: djData.data.stats?.totalRequests || 0,
            availableRequests: validRequests.length,
            blacklistedSongs: validBlacklist.length,
            songsOnCooldown: validCooldown.length
          })
          
          setLastRefresh(new Date())
          
          console.log('Filtered data:', {
            requests: validRequests.length,
            blacklist: validBlacklist.length,
            cooldown: validCooldown.length
          })
        } else {
          throw new Error('Invalid data structure from API')
        }
      } else {
        throw new Error(result.error || 'Failed to fetch DJ data')
      }

    } catch (error) {
      console.error('Error fetching DJ data:', error)
      setError('Failed to load DJ data')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle playing a song (move from requests to cooldown)
  const handlePlaySong = useCallback(async (songId: string) => {
    const songToPlay = songRequests.find(req => req.id === songId)
    if (!songToPlay) return

    // Calculate cooldown time (2 hours from now)
    const cooldownUntil = new Date(Date.now() + COOLDOWN_DURATION).toISOString()

    // Use the actual songId (not the record ID) for the API call
    const actualSongId = songToPlay.songId || generateSongId(songToPlay.title, songToPlay.artist)

    // Optimistically update the UI immediately
    setSongRequests(prev => prev.filter(req => req.id !== songId))
    setCooldownSongs(prev => [...prev, {
      id: songToPlay.id,
      songId: actualSongId,
      title: songToPlay.title,
      artist: songToPlay.artist,
      cooldownUntil: cooldownUntil,
      playedAt: new Date().toISOString()
    }])
    
    // Update stats optimistically
    setStats(prev => ({
      ...prev,
      availableRequests: prev.availableRequests - 1,
      songsOnCooldown: prev.songsOnCooldown + 1
    }))

    try {
      const response = await fetch('/api/dj/play-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          songId: actualSongId, // Send the actual songId, not the record ID
          title: songToPlay.title,
          artist: songToPlay.artist,
          cooldownUntil
        })
      })

      if (!response.ok) {
        // If API call fails, revert the optimistic update
        setSongRequests(prev => [...prev, songToPlay])
        setCooldownSongs(prev => prev.filter(song => song.id !== songId))
        setStats(prev => ({
          ...prev,
          availableRequests: prev.availableRequests + 1,
          songsOnCooldown: prev.songsOnCooldown - 1
        }))
        throw new Error('Failed to play song')
      }

      console.log('Play song API called with:', {
        songId: actualSongId,
        title: songToPlay.title,
        artist: songToPlay.artist
      })

    } catch (error) {
      console.error('Error playing song:', error)
      setError('Failed to play song')
    }
  }, [songRequests, COOLDOWN_DURATION])

  // Handle adding song to blacklist
  const handleAddToBlacklist = useCallback(async (title: string, artist: string) => {
    const songId = generateSongId(title, artist)
    const blacklistedSong = { 
      id: songId, 
      songId: songId, // Use the generated songId format
      title, 
      artist,
      addedAt: new Date().toISOString()
    }

    // Find if this song is currently in requests
    const existingSongRequest = songRequests.find(req => 
      req.title.toLowerCase() === title.toLowerCase() && 
      req.artist.toLowerCase() === artist.toLowerCase()
    )

    // Optimistically update the UI immediately
    if (existingSongRequest) {
      setSongRequests(prev => prev.filter(req => req.id !== existingSongRequest.id))
      setStats(prev => ({
        ...prev,
        availableRequests: prev.availableRequests - 1,
        blacklistedSongs: prev.blacklistedSongs + 1
      }))
    } else {
      setStats(prev => ({
        ...prev,
        blacklistedSongs: prev.blacklistedSongs + 1
      }))
    }
    
    setBlacklist(prev => {
      if (prev.some(s => s.songId === songId)) return prev // Already blacklisted
      return [...prev, blacklistedSong]
    })

    try {
      const response = await fetch('/api/dj/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: songId, // Send the generated songId format
          title,
          artist
        })
      })

      if (!response.ok) {
        // If API call fails, revert the optimistic update
        if (existingSongRequest) {
          setSongRequests(prev => [...prev, existingSongRequest])
          setStats(prev => ({
            ...prev,
            availableRequests: prev.availableRequests + 1,
            blacklistedSongs: prev.blacklistedSongs - 1
          }))
        } else {
          setStats(prev => ({
            ...prev,
            blacklistedSongs: prev.blacklistedSongs - 1
          }))
        }
        setBlacklist(prev => prev.filter(song => song.songId !== songId))
        throw new Error('Failed to blacklist song')
      }

      console.log('Blacklist API called with:', {
        songId: songId,
        title,
        artist
      })

    } catch (error) {
      console.error('Error blacklisting song:', error)
      setError('Failed to blacklist song')
    }
  }, [songRequests])

  // Handle removing song from blacklist
  const handleRemoveFromBlacklist = useCallback(async (songId: string) => {
    // Find the song being removed for potential revert
    const songToRemove = blacklist.find(song => song.id === songId)
    if (!songToRemove) return

    // Optimistically update the UI immediately
    setBlacklist(prev => prev.filter(song => song.id !== songId))
    setStats(prev => ({
      ...prev,
      blacklistedSongs: prev.blacklistedSongs - 1
    }))

    try {
      const response = await fetch('/api/dj/blacklist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: songToRemove.songId || songId })
      })

      if (!response.ok) {
        // If API call fails, revert the optimistic update
        setBlacklist(prev => [...prev, songToRemove])
        setStats(prev => ({
          ...prev,
          blacklistedSongs: prev.blacklistedSongs + 1
        }))
        throw new Error('Failed to remove from blacklist')
      }

    } catch (error) {
      console.error('Error removing from blacklist:', error)
      setError('Failed to remove from blacklist')
    }
  }, [blacklist])

  // Load data on component mount
  useEffect(() => {
    fetchDjData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-pink-500 mx-auto"></div>
          <h2 className="text-lg sm:text-2xl font-bold text-white mt-4">Loading DJ Dashboard...</h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2">Getting the latest requests</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800 shadow-lg border-b-4 border-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition-colors touch-manipulation"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
              <div className="bg-pink-500 p-2 sm:p-3 rounded-lg">
                <SpeakerWaveIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">DJ Dashboard</h1>
                <p className="text-xs sm:text-sm lg:text-base text-slate-300">
                  {stats.availableRequests} available • {stats.blacklistedSongs} blacklisted • {stats.songsOnCooldown} on cooldown
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              {lastRefresh && (
                <div className="text-xs sm:text-sm text-slate-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
              <div className="flex space-x-2 w-full sm:w-auto">
                <button
                  onClick={fetchDjData}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base touch-manipulation"
                >
                  <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base touch-manipulation"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-500/20 border border-red-400 text-red-300 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-300 hover:text-red-100 touch-manipulation"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <DjView 
          songRequests={songRequests}
          cooldownSongs={cooldownSongs}
          blacklist={blacklist}
          stats={stats}
          handlePlaySong={handlePlaySong}
          handleAddToBlacklist={handleAddToBlacklist}
          handleRemoveFromBlacklist={handleRemoveFromBlacklist}
        />
      </div>
    </div>
  )
}
