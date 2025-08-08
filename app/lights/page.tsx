// app/lights/page.tsx - MISSING FILE
import { LightBulbIcon } from '@heroicons/react/24/outline'

export default function LightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <LightBulbIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lights Manager</h1>
              <p className="text-gray-600">Automated lighting control for The Cowboy Saloon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <LightBulbIcon className="mx-auto h-16 w-16 text-blue-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lights Manager Coming Soon</h2>
          <p className="text-gray-600">
            Advanced lighting control and automation features are currently in development.
          </p>
        </div>
      </div>
    </div>
  )
}
