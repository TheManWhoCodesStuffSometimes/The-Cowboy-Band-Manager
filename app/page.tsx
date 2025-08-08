// app/page.tsx - CLEAN VERSION (Remove duplicated content)
import Link from 'next/link'
import { SpeakerWaveIcon, MicrophoneIcon, LightBulbIcon } from '@heroicons/react/24/outline'
import BandDashboard from '@/components/BandDashboard'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Main Navigation Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-500 p-3 rounded-lg">
                <SpeakerWaveIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">The Cowboy Saloon</h1>
                <p className="text-gray-600">Management Dashboard</p>
              </div>
            </div>
            
            {/* Management Tools Navigation */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/bands" 
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <SpeakerWaveIcon className="h-5 w-5 mr-2" />
                Band Manager
              </Link>
              
              <Link 
                href="/dj" 
                className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                <MicrophoneIcon className="h-5 w-5 mr-2" />
                DJ Dashboard
              </Link>
              
              <Link 
                href="/lights" 
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <LightBulbIcon className="h-5 w-5 mr-2" />
                Lights Manager
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Default to Band Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Management Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Band Management Card */}
            <Link href="/bands" className="group">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-lg border-2 border-orange-300 hover:border-orange-500 transition-all group-hover:shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <SpeakerWaveIcon className="h-8 w-8 text-orange-600" />
                  <h3 className="text-lg font-bold text-orange-900">Band Booking</h3>
                </div>
                <p className="text-orange-700 text-sm">
                  Manage band analytics, bookings, and performance tracking. Smart recommendations powered by AI.
                </p>
                <div className="mt-4 text-orange-600 font-semibold group-hover:text-orange-800">
                  Manage Bands →
                </div>
              </div>
            </Link>

            {/* DJ Management Card */}
            <Link href="/dj" className="group">
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-6 rounded-lg border-2 border-pink-300 hover:border-pink-500 transition-all group-hover:shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <MicrophoneIcon className="h-8 w-8 text-pink-600" />
                  <h3 className="text-lg font-bold text-pink-900">DJ Dashboard</h3>
                </div>
                <p className="text-pink-700 text-sm">
                  Live song request management, blacklist control, and cooldown tracking for DJ performances.
                </p>
                <div className="mt-4 text-pink-600 font-semibold group-hover:text-pink-800">
                  DJ Controls →
                </div>
              </div>
            </Link>

            {/* Lights Management Card */}
            <Link href="/lights" className="group">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-lg border-2 border-blue-300 hover:border-blue-500 transition-all group-hover:shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <LightBulbIcon className="h-8 w-8 text-blue-600" />
                  <h3 className="text-lg font-bold text-blue-900">Lights Control</h3>
                </div>
                <p className="text-blue-700 text-sm">
                  Automated lighting control and scene management for performances and events.
                </p>
                <div className="mt-4 text-blue-600 font-semibold group-hover:text-blue-800">
                  Control Lights →
                </div>
              </div>
            </Link>

          </div>
        </div>

        {/* Default Band Dashboard Content */}
        <BandDashboard />
      </div>
    </div>
  )
}
