// components/dj/DjAuthWrapper.tsx - MISSING FILE
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

// components/dj/icons/ClockIcon.tsx - MISSING FILE
import React from 'react'

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

export default ClockIcon
