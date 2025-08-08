// app/dj/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MicrophoneIcon } from '@heroicons/react/24/outline'

export default function DjLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLoginAttempt = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Hardcoded credentials as per the original request
    if (username === 'Cowboy' && password === 'Thecowboyisthebest') {
      // Set authentication in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('isDjAuthenticated', 'true')
      }
      router.push('/dj')
    } else {
      setError('Invalid username or password.')
      setPassword('')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-4">
        <form onSubmit={handleLoginAttempt} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-6 shadow-lg shadow-pink-500/10">
          <div className="text-center">
            <div className="bg-pink-500 p-3 rounded-lg w-fit mx-auto mb-4">
              <MicrophoneIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-pink-400">DJ Login</h2>
            <p className="text-slate-400 mt-1">Enter your credentials to access the DJ panel.</p>
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-md p-3">
              <p className="text-red-400 text-center text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-500 hover:bg-pink-400 disabled:bg-pink-600 disabled:cursor-not-allowed text-slate-900 font-bold py-3 px-4 rounded-lg transition-all duration-300"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// components/dj/DjAuthWrapper.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DjAuthWrapperProps {
  children: React.ReactNode
}

export default function DjAuthWrapper({ children }: DjAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const authStatus = sessionStorage.getItem('isDjAuthenticated') === 'true'
    setIsAuthenticated(authStatus)
    
    if (!authStatus) {
      router.push('/dj/login')
    }
  }, [router])

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <h2 className="text-2xl font-bold text-white mt-4">Checking Access...</h2>
        </div>
      </div>
    )
  }

  // Show login redirect if not authenticated
  if (!isAuthenticated) {
    return null // Router will handle redirect
  }

  // Show DJ dashboard if authenticated
  return <>{children}</>
}

// Updated app/dj/page.tsx with auth wrapper
'use client'

import DjAuthWrapper from '@/components/dj/DjAuthWrapper'
import { useState, useEffect, useCallback } from 'react'
import { SpeakerWaveIcon, ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import DjView from '@/components/dj/DjView'
import type { SongRequest, CooldownSong, BlacklistedSong } from '@/types/dj'

function DjDashboardContent() {
  const [songRequests, setSongRequests] = useState<SongRequest[]>([])
  const [cooldownSongs, setCooldownSongs] = useState<CooldownSong[]>([])
  const [blacklist, setBlacklist] = useState<BlacklistedSong[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const router = useRouter()

  const COOLDOWN_DURATION = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('isDjAuthenticated')
    router.push('/')
  }

  // Generate consistent song IDs
  const generateSongId = (title: string, artist: string) => {
    return `${artist.toLowerCase().trim().replace(/\s+/g, '-')}-${title.toLowerCase().trim().replace(/\s+/g, '-')}`
  }

  // ... (rest of the DJ dashboard logic from previous implementation)
  // [Previous fetchDjData, handlePlaySong, handleAddToBlacklist, handleRemoveFromBlacklist functions]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header with logout */}
      <div className="bg-slate-800 shadow-lg border-b-4 border-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-white" />
              </button>
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
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of DJ dashboard content */}
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

export default function DjDashboard() {
  return (
    <DjAuthWrapper>
      <DjDashboardContent />
    </DjAuthWrapper>
  )
}
