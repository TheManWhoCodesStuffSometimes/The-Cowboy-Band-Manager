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
