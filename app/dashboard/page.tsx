// app/dashboard/page.tsx - Updated Management Overview Page
'use client'

import Link from 'next/link'
import { SpeakerWaveIcon, MicrophoneIcon, LightBulbIcon, CalculatorIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  // Handle logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAppAuthenticated')
    }
    // Refresh the page to trigger the app-level login
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-orange-500 p-2 sm:p-3 rounded-lg">
                <SpeakerWaveIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">The Cowboy Saloon</h1>
                <p className="text-sm sm:text-base text-gray-600">Management Dashboard</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            🤠 Welcome to the Saloon
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your management tool to get started. Everything you need to run the show.
          </p>
        </div>

        {/* Management Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          
          {/* Band Management Card */}
          <Link href="/bands" className="group">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-orange-300 hover:border-orange-500 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-orange-500 p-4 sm:p-5 rounded-xl group-hover:bg-orange-600 transition-colors">
                  <SpeakerWaveIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-orange-900 mb-2">Band Discovery</h3>
                  <p className="text-sm sm:text-base text-orange-700 leading-relaxed">
                    AI-powered band analytics, booking management, and smart recommendations for your venue.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <div className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold group-hover:bg-orange-700 transition-colors">
                    Discover Bands →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Financial Analysis Card */}
          <Link href="/financial" className="group">
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-green-300 hover:border-green-500 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-green-500 p-4 sm:p-5 rounded-xl group-hover:bg-green-600 transition-colors">
                  <CalculatorIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-2">Financial Analysis</h3>
                  <p className="text-sm sm:text-base text-green-700 leading-relaxed">
                    Break-even analysis, profitability calculations, and booking cost optimization tools.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold group-hover:bg-green-700 transition-colors">
                    Analyze Costs →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* DJ Management Card */}
          <Link href="/dj" className="group">
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-pink-300 hover:border-pink-500 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-pink-500 p-4 sm:p-5 rounded-xl group-hover:bg-pink-600 transition-colors">
                  <MicrophoneIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-pink-900 mb-2">DJ Dashboard</h3>
                  <p className="text-sm sm:text-base text-pink-700 leading-relaxed">
                    Live song request management, blacklist control, and cooldown tracking for performances.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <div className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold group-hover:bg-pink-700 transition-colors">
                    DJ Controls →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Lights Management Card */}
          <Link href="/lights" className="group">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-blue-300 hover:border-blue-500 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-blue-500 p-4 sm:p-5 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <LightBulbIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">Lights Control</h3>
                  <p className="text-sm sm:text-base text-blue-700 leading-relaxed">
                    Smart lighting coordination and scene management for performances and events.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold group-hover:bg-blue-700 transition-colors">
                    Control Lights →
                  </div>
                </div>
              </div>
            </div>
          </Link>

        </div>

        {/* Quick Stats or Info Section */}
        <div className="mt-12 sm:mt-16 bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">System Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">✓</div>
                <div className="text-sm sm:text-base text-green-800 font-medium">All Systems Online</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">⚡</div>
                <div className="text-sm sm:text-base text-blue-800 font-medium">Real-time Updates</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">🤖</div>
                <div className="text-sm sm:text-base text-purple-800 font-medium">AI Analytics Ready</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">💰</div>
                <div className="text-sm sm:text-base text-green-800 font-medium">Financial Tools</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
