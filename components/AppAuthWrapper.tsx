// components/AppAuthWrapper.tsx
'use client'

import { useEffect, useState } from 'react'
import { MicrophoneIcon } from '@heroicons/react/24/outline'

interface AppAuthWrapperProps {
  children: React.ReactNode
}

export default function AppAuthWrapper({ children }: AppAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check authentication status on mount
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem('isAppAuthenticated') === 'true'
      setIsAuthenticated(authStatus)
    }
  }, [])

  const handleLoginAttempt = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Hardcoded credentials as per the original request
    if (username === 'Cowboy' && password === 'Thecowboyisthebest') {
      // Set authentication in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('isAppAuthenticated', 'true')
      }
      setIsAuthenticated(true)
    } else {
      setError('Invalid username or password.')
      setPassword('')
    }
    
    setIsLoading(false)
  }

  // Show loading while checking auth status
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <h2 className="text-2xl font-bold text-white mt-4">Loading...</h2>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-4">
          <form onSubmit={handleLoginAttempt} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-6 shadow-lg shadow-orange-500/10">
            <div className="text-center">
              <div className="bg-orange-500 p-3 rounded-lg w-fit mx-auto mb-4">
                <MicrophoneIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-orange-400">The Cowboy Saloon</h2>
              <p className="text-slate-400 mt-1">Management System Login</p>
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
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-600 disabled:cursor-not-allowed text-slate-900 font-bold py-3 px-4 rounded-lg transition-all duration-300"
            >
              {isLoading ? 'Logging in...' : 'Access Management System'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Show the main app if authenticated
  return <>{children}</>
}
