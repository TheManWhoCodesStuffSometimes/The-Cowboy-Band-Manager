// components/dj/DjView.tsx - Updated for new unified data structure
'use client'

import React, { useState, useEffect } from 'react'
import type { SongRequest, CooldownSong, BlacklistedSong } from '@/types/dj'
import PlayIcon from './icons/PlayIcon'
import ClockIcon from './icons/ClockIcon'
import BlacklistIcon from './icons/BlacklistIcon'
import TrashIcon from './icons/TrashIcon'

interface DjViewProps {
  songRequests: SongRequest[]
  cooldownSongs: CooldownSong[]
  blacklist: BlacklistedSong[]
  stats: {
    totalRequests: number
    availableRequests: number
    blacklistedSongs: number
    songsOnCooldown: number
  }
  handlePlaySong: (songId: string) => void
  handleAddToBlacklist: (title: string, artist: string) => void
  handleRemoveFromBlacklist: (songId: string) => void
}

const formatTime = (cooldownUntil: string): string => {
  const targetTime = new Date(cooldownUntil).getTime()
  const now = Date.now()
  const ms = targetTime - now
  
  if (ms <= 0) return "00:00:00"
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const CooldownItem: React.FC<{ song: CooldownSong }> = ({ song }) => {
  const [timeRemaining, setTimeRemaining] = useState(formatTime(song.cooldownUntil))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTime(song.cooldownUntil))
    }, 1000)
    return () => clearInterval(interval)
  }, [song.cooldownUntil])
  
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-300 text-sm sm:text-base truncate">{song.title}</p>
        <p className="text-xs sm:text-sm text-slate-400 truncate">{song.artist}</p>
      </div>
      <div className="flex items-center space-x-2 text-yellow-400 ml-3 flex-shrink-0">
        <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
        <span className="font-mono text-xs sm:text-sm">{timeRemaining}</span>
      </div>
    </div>
  )
}

const BlacklistForm: React.FC<{ onBlacklist: (title: string, artist: string) => void }> = ({ onBlacklist }) => {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && artist.trim()) {
      onBlacklist(title.trim(), artist.trim())
      setTitle('')
      setArtist('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-slate-900/60 rounded-lg border border-slate-700 space-y-3">
      <h3 className="font-semibold text-slate-300 text-sm sm:text-base">Manually Blacklist Song</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Song Title"
        className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-pink-500 outline-none text-sm sm:text-base"
      />
      <input
        type="text"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artist"
        className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-pink-500 outline-none text-sm sm:text-base"
      />
      <button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm sm:text-base touch-manipulation"
      >
        Add to Blacklist
      </button>
    </form>
  )
}

const DjView: React.FC<DjViewProps> = ({ 
  songRequests, 
  cooldownSongs, 
  blacklist, 
  stats,
  handlePlaySong, 
  handleAddToBlacklist, 
  handleRemoveFromBlacklist 
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'cooldown' | 'blacklist'>('requests')
  
  // Filter out any invalid entries that might have slipped through
  const validRequests = songRequests.filter(song => 
    song && song.title && song.artist && song.title.trim() && song.artist.trim()
  )
  const validCooldown = cooldownSongs.filter(song => 
    song && song.title && song.artist && song.title.trim() && song.artist.trim()
  )
  const validBlacklist = blacklist.filter(song => 
    song && song.title && song.artist && song.title.trim() && song.artist.trim()
  )
  
  // Sort requests by request count (if available), otherwise by title
  const sortedRequests = [...validRequests].sort((a, b) => {
    if (a.requestCount && b.requestCount) {
      return b.requestCount - a.requestCount
    }
    return a.title.localeCompare(b.title)
  })
  
  const sortedBlacklist = [...validBlacklist].sort((a, b) => a.title.localeCompare(b.title))

  // Mobile tab navigation
  const TabButton: React.FC<{ 
    tab: 'requests' | 'cooldown' | 'blacklist'
    label: string
    count: number
    color: string
  }> = ({ tab, label, count, color }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors touch-manipulation ${
        activeTab === tab
          ? `bg-${color}-500 text-white`
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      <div className="text-sm sm:text-base">{label}</div>
      <div className={`text-xs ${activeTab === tab ? 'text-white' : 'text-slate-400'}`}>
        {count}
      </div>
    </button>
  )

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Stats Summary Bar */}
      <div className="mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-cyan-400">{stats.totalRequests}</div>
            <div className="text-sm text-slate-400">Total Requests</div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{stats.availableRequests}</div>
            <div className="text-sm text-slate-400">Available</div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">{stats.songsOnCooldown}</div>
            <div className="text-sm text-slate-400">On Cooldown</div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400">{stats.blacklistedSongs}</div>
            <div className="text-sm text-slate-400">Blacklisted</div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-8">
        {/* Available Requests */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">Available Requests</h2>
            <span className="bg-cyan-500 text-slate-900 px-2 py-1 rounded-full text-sm font-bold">
              {sortedRequests.length}
            </span>
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {sortedRequests.length > 0 ? sortedRequests.map((song) => (
              <div key={song.id} className="flex items-center justify-between p-4 bg-slate-900/60 rounded-lg border border-slate-700 group hover:border-slate-600 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{song.title}</p>
                  <p className="text-sm text-slate-400 truncate">{song.artist}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {song.requestCount && (
                    <span className="text-lg font-bold bg-cyan-500 text-white rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                      {song.requestCount}
                    </span>
                  )}
                  <button 
                    onClick={() => handlePlaySong(song.id)}
                    title="Play Song"
                    className="bg-green-500 text-white p-2 rounded-full transform transition-all duration-200 hover:bg-green-400 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 flex-shrink-0"
                  >
                    <PlayIcon className="w-5 h-5"/>
                  </button>
                  <button 
                    onClick={() => handleAddToBlacklist(song.title, song.artist)}
                    title="Blacklist Song"
                    className="bg-red-600 text-white p-2 rounded-full transform transition-all duration-200 hover:bg-red-500 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 flex-shrink-0"
                  >
                    <BlacklistIcon className="w-5 h-5"/>
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-slate-400 italic">No available requests. Songs may be on cooldown or blacklisted.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* On Cooldown */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg shadow-yellow-500/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-yellow-400">On Cooldown</h2>
            <span className="bg-yellow-500 text-slate-900 px-2 py-1 rounded-full text-sm font-bold">
              {cooldownSongs.length}
            </span>
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {validCooldown.length > 0 ? validCooldown.map((song) => (
              <CooldownItem key={song.id} song={song} />
            )) : (
              <div className="text-center py-8">
                <p className="text-slate-400 italic">No songs on cooldown.</p>
              </div>
            )}
          </div>
        </div>

        {/* Blacklist */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg shadow-red-500/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-red-500">Blacklist</h2>
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
              {sortedBlacklist.length}
            </span>
          </div>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <BlacklistForm onBlacklist={handleAddToBlacklist} />
            <div className="space-y-3 pt-4">
              {sortedBlacklist.length > 0 ? sortedBlacklist.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-300 truncate">{song.title}</p>
                    <p className="text-sm text-slate-400 truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromBlacklist(song.id)}
                    title="Remove from Blacklist"
                    className="text-slate-400 hover:text-red-400 p-2 rounded-full transition-colors ml-2 flex-shrink-0"
                  >
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              )) : (
                <div className="text-center pt-8">
                  <p className="text-slate-400 italic">The blacklist is empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block lg:hidden">
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <TabButton tab="requests" label="Requests" count={sortedRequests.length} color="cyan" />
          <TabButton tab="cooldown" label="Cooldown" count={validCooldown.length} color="yellow" />
          <TabButton tab="blacklist" label="Blacklist" count={sortedBlacklist.length} color="red" />
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-cyan-400 mb-4">Available Requests</h2>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {sortedRequests.length > 0 ? sortedRequests.map((song) => (
                  <div key={song.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-900/60 rounded-lg border border-slate-700">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-200 text-sm sm:text-base truncate">{song.title}</p>
                      <p className="text-xs sm:text-sm text-slate-400 truncate">{song.artist}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      {song.requestCount && (
                        <span className="text-sm sm:text-lg font-bold bg-cyan-500 text-white rounded-full h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center flex-shrink-0">
                          {song.requestCount}
                        </span>
                      )}
                      <button 
                        onClick={() => handlePlaySong(song.id)}
                        className="bg-green-500 text-white p-2 rounded-full transition-colors hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 flex-shrink-0 touch-manipulation"
                      >
                        <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                      </button>
                      <button 
                        onClick={() => handleAddToBlacklist(song.title, song.artist)}
                        className="bg-red-600 text-white p-2 rounded-full transition-colors hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 flex-shrink-0 touch-manipulation"
                      >
                        <BlacklistIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 italic">No available requests. Songs may be on cooldown or blacklisted.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cooldown Tab */}
          {activeTab === 'cooldown' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">On Cooldown</h2>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {validCooldown.length > 0 ? validCooldown.map((song) => (
                  <CooldownItem key={song.id} song={song} />
                )) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 italic">No songs on cooldown.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Blacklist Tab */}
          {activeTab === 'blacklist' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-4">Blacklist</h2>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <BlacklistForm onBlacklist={handleAddToBlacklist} />
                <div className="space-y-3">
                  {sortedBlacklist.length > 0 ? sortedBlacklist.map((song) => (
                    <div key={song.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-300 text-sm sm:text-base truncate">{song.title}</p>
                        <p className="text-xs sm:text-sm text-slate-400 truncate">{song.artist}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromBlacklist(song.id)}
                        className="text-slate-400 hover:text-red-400 p-2 rounded-full transition-colors ml-2 flex-shrink-0 touch-manipulation"
                      >
                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                      </button>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 italic">The blacklist is empty.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DjView
