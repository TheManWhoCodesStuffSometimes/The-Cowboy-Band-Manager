// components/dj/DjView.tsx
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
  handlePlaySong: (songId: string) => void
  handleAddToBlacklist: (title: string, artist: string) => void
  handleRemoveFromBlacklist: (songId: string) => void
}

const formatTime = (ms: number): string => {
  if (ms <= 0) return "00:00:00"
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const CooldownItem: React.FC<{ song: CooldownSong }> = ({ song }) => {
  const [timeRemaining, setTimeRemaining] = useState(song.cooldownUntil - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = song.cooldownUntil - Date.now()
      setTimeRemaining(remaining > 0 ? remaining : 0)
    }, 1000)
    return () => clearInterval(interval)
  }, [song.cooldownUntil])
  
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div>
        <p className="font-semibold text-slate-300">{song.title}</p>
        <p className="text-sm text-slate-400">{song.artist}</p>
      </div>
      <div className="flex items-center space-x-2 text-yellow-400">
        <ClockIcon className="w-5 h-5"/>
        <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
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
    <form onSubmit={handleSubmit} className="p-4 bg-slate-900/60 rounded-lg border border-slate-700 space-y-3">
      <h3 className="font-semibold text-slate-300">Manually Blacklist Song</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Song Title"
        className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-pink-500 outline-none"
      />
      <input
        type="text"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artist"
        className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-pink-500 outline-none"
      />
      <button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
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
  handlePlaySong, 
  handleAddToBlacklist, 
  handleRemoveFromBlacklist 
}) => {
  const sortedRequests = [...songRequests].sort((a, b) => b.requestCount - a.requestCount)
  const sortedBlacklist = [...blacklist].sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Top Requests */}
      <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-cyan-400">Top Requests</h2>
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
                <span className="text-lg font-bold bg-cyan-500 text-white rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  {song.requestCount}
                </span>
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
              <p className="text-slate-400 italic">No requests yet. The night is young!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* On Cooldown */}
      <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg shadow-yellow-500/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">On Cooldown</h2>
          <span className="bg-yellow-500 text-slate-900 px-2 py-1 rounded-full text-sm font-bold">
            {cooldownSongs.length}
          </span>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {cooldownSongs.length > 0 ? [...cooldownSongs].sort((a,b) => b.cooldownUntil - a.cooldownUntil).map((song) => (
            <CooldownItem key={song.id} song={song} />
          )) : (
            <div className="text-center py-8">
              <p className="text-slate-400 italic">No songs on cooldown.</p>
            </div>
          )}
        </div>
      </div>

      {/* Blacklist */}
      <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg shadow-red-500/10">
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
  )
}

export default DjView
