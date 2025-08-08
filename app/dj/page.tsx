// app/dj/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { SpeakerWaveIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import DjView from '@/components/dj/DjView'
import type { SongRequest, CooldownSong, BlacklistedSong } from '@/types/dj'

export default function DjDashboard() {
  const [songRequests, setSongRequests] = useState<SongRequest[]>([])
  const [cooldownSongs, setCooldownSongs] = useState<CooldownSong[]>([])
  const [blacklist, setBlacklist] = useState<BlacklistedSong[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const COOLDOWN_DURATION = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

  // Generate consistent song IDs
  const generateSongId = (title: string, artist: string) => {
    return `${artist.toLowerCase().trim().replace(/\s+/g, '-')}-${title.toLowerCase().trim().replace(/\s+/g, '-')}`
  }

  // Fetch DJ data from API
  const fetchDjData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [requestsResponse, blacklistResponse, cooldownResponse] = await Promise.all([
        fetch('/api/dj/requests'),
        fetch('/api/dj/blacklist'),
        fetch('/api/dj/cooldown')
      ])

      if (!requestsResponse.ok || !blacklistResponse.ok || !cooldownResponse.ok) {
        throw new Error('Failed to fetch DJ data')
      }

      const [requests, blacklistData, cooldownData] = await Promise.all([
        requestsResponse.json(),
        blacklistResponse.json(),
        cooldownResponse.json()
      ])

      setSongRequests(requests.data || [])
      setBlacklist(blacklistData.data || [])
      setCooldownSongs(cooldownData.data || [])
      setLastRefresh(new Date())

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

    try {
      // Call API to move song to cooldown
      const response = await fetch('/api/dj/play-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId,
          cooldownUntil: Date.now() + COOLDOWN_DURATION
        })
      })

      if (!response.ok) throw new Error('Failed to play song')

      // Update local state
      setSongRequests(prev => prev.filter(req => req.id !== songId))
      setCooldownSongs(prev => [...prev, {
        ...songToPlay,
        cooldownUntil: Date.now() + COOLDOWN_DURATION
      }])

    } catch (error) {
      console.error('Error playing song:', error)
      setError('Failed to play song')
    }
  }, [songRequests, COOLDOWN_DURATION])

  // Handle adding song to blacklist
  const handleAddToBlacklist = useCallback(async (title: string, artist: string) => {
    const songId = generateSongId(title, artist)
    const blacklistedSong: BlacklistedSong = { id: songId, title, artist }

    try {
      const response = await fetch('/api/dj/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blacklistedSong)
      })

      if (!response.ok) throw new Error('Failed to blacklist song')

      // Update local state
      setBlacklist(prev => {
        if (prev.some(s => s.id === songId)) return prev // Already blacklisted
        return [...prev, blacklistedSong]
      })

      // Remove any pending requests for this song
      setSongRequests(prev => prev.filter(req => req.id !== songId))

    } catch (error) {
      console.error('Error blacklisting song:', error)
      setError('Failed to blacklist song')
    }
  }, [])

  // Handle removing song from blacklist
  const handleRemoveFromBlacklist = useCallback(async (songId: string) => {
    try {
      const response = await fetch('/api/dj/blacklist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId })
      })

      if (!response.ok) throw new Error('Failed to remove from blacklist')

      setBlacklist(prev => prev.filter(song => song.id !== songId))

    } catch (error) {
      console.error('Error removing from blacklist:', error)
      setError('Failed to remove from blacklist')
    }
  }, [])

  // Periodically clean up expired cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldownSongs(prev => prev.filter(song => song.cooldownUntil > Date.now()))
    }, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [])

  // Load data on component mount
  useEffect(() => {
    fetchDjData()
    
    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(fetchDjData, 30000)
    return () => clearInterval(refreshInterval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Loading DJ Dashboard...</h2>
          <p className="text-gray-600 mt-2">Getting the latest requests</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800 shadow-lg border-b-4 border-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-pink-500 p-3 rounded-lg">
                <SpeakerWaveIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">DJ Dashboard</h1>
                <p className="text-slate-300">Manage song requests and blacklist</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {lastRefresh && (
                <div className="text-sm text-slate-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={fetchDjData}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DjView 
          songRequests={songRequests}
          cooldownSongs={cooldownSongs}
          blacklist={blacklist}
          handlePlaySong={handlePlaySong}
          handleAddToBlacklist={handleAddToBlacklist}
          handleRemoveFromBlacklist={handleRemoveFromBlacklist}
        />
      </div>
    </div>
  )
}
