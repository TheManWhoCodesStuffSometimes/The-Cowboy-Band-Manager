// app/dj/page.tsx - Mobile-optimized DJ Dashboard
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

  // Fetch DJ data from API
  const fetchDjData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch from our API endpoints
      const [requestsResponse, blacklistResponse, cooldownResponse] = await Promise.all([
        fetch('/api/dj/requests'),
        fetch('/api/dj/blacklist'),
        fetch('/api/dj/cooldown')
      ])

      const [requestsData, blacklistData, cooldownData] = await Promise.all([
        requestsResponse.json(),
        blacklistResponse.json(),
        cooldownResponse.json()
      ])

      if (requestsData.success) setSongRequests(requestsData.data || [])
      if (blacklistData.success) setBlacklist(blacklistData.data || [])
      if (cooldownData.success) setCooldownSongs(cooldownData.data || [])
      
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
      const response = await fetch('/api/dj/play-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, ...songToPlay })
      })

      if (response.ok) {
        setSongRequests(prev => prev.filter(req => req.id !== songId))
        setCooldownSongs(prev => [...prev, {
          ...songToPlay,
          cooldownUntil: Date.now() + COOLDOWN_DURATION
        }])
      } else {
        throw new Error('Failed to play song')
      }

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
      songId: songId,
      title, 
      artist 
    }

    try {
      const response = await fetch('/api/dj/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blacklistedSong)
      })

      if (response.ok) {
        setBlacklist(prev => {
          if (prev.some(s => s.id === songId)) return prev // Already blacklisted
          return [...prev, blacklistedSong]
        })

        // Remove any pending requests for this song
        setSongRequests(prev => prev.filter(req => req.id !== songId))
      } else {
        throw new Error('Failed to blacklist song')
      }

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

      if (response.ok) {
        setBlacklist(prev => prev.filter(song => song.id !== songId))
      } else {
        throw new Error('Failed to remove from blacklist')
      }

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
                <p className="text-xs sm:text-sm lg:text-base text-slate-300">Manage song requests and blacklist</p>
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
          handlePlaySong={handlePlaySong}
          handleAddToBlacklist={handleAddToBlacklist}
          handleRemoveFromBlacklist={handleRemoveFromBlacklist}
        />
      </div>
    </div>
  )
}
