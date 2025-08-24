// components/bands/InquiryDashboard.tsx - Updated without financial analysis and AI cost estimate
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, FunnelIcon, SpeakerWaveIcon, ArrowPathIcon, AdjustmentsHorizontalIcon, ChevronDownIcon, ChevronUpIcon, ArrowLeftIcon, XMarkIcon, CalculatorIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon, ClockIcon, StarIcon } from '@heroicons/react/24/solid'

interface Band {
  id: string
  name: string
  overallScore: number
  // Enhanced ranking metrics (0-100) - NOW 6 COMPONENTS (removed cost effectiveness)
  growthMomentumScore: number
  fanEngagementScore: number
  digitalPopularityScore: number
  livePotentialScore: number
  venueFitScore: number
  geographicFitScore: number
  // Keep cost effectiveness score for display purposes but don't use in ranking
  costEffectivenessScore: number
  recommendation: 'BOOK SOON' | 'STRONG CONSIDER' | 'MAYBE' | 'PASS'
  spotifyFollowers: number
  spotifyPopularity: number
  spotifyUrl?: string
  youtubeSubscribers: number
  youtubeViews: number
  youtubeVideoCount: number
  averageViewsPerVideo: number
  youtubeHasVevo: boolean
  estimatedDraw: string
  aiCostEstimate?: number
  keyStrengths: string
  mainConcerns: string
  bookingStatus: 'Not Contacted' | 'Contacted' | 'Negotiating' | 'Booked' | 'Passed'
  lastUpdated: string
  dateAnalyzed: string
  confidenceLevel: 'High' | 'Medium' | 'Low'
  aiAnalysisNotes?: string
  // Performance tracking fields (for filtering out played bands)
  hasPlayed?: 'Yes' | 'No'
}

interface RankingFocus {
  value: string
  label: string
  description: string
  icon: string
}

interface PerformanceData {
  overallVibe: number
  attendance: number
  bandBookingCost: number
  wouldBookAgain: 'Yes' | 'No' | 'Maybe'
  openingHeadliner: 'Opening' | 'Headliner'
}

interface RemovalData {
  reasons: string[]
}

const rankingFocusOptions: RankingFocus[] = [
  { 
    value: 'hidden_gems', 
    label: 'Hidden Gems', 
    description: 'Emerging artists before they blow up',
    icon: '💎'
  },
  { 
    value: 'genre_fit', 
    label: 'Best Genre Fit', 
    description: 'Country/Western artists that match our vibe',
    icon: '🤠'
  },
  { 
    value: 'proven_draw', 
    label: 'Proven Draw', 
    description: 'Established acts with ticket-selling history',
    icon: '🎯'
  },
  { 
    value: 'local_buzz', 
    label: 'Local Buzz', 
    description: 'Regional artists with Wyoming connections',
    icon: '🏔️'
  },
  {
    value: 'rising_stars',
    label: 'Rising Stars',
    description: 'Artists showing explosive growth',
    icon: '🚀'
  }
]

interface RankingWeights {
  growthMomentum: number
  fanEngagement: number
  digitalPopularity: number
  livePotential: number
  venueFit: number
  geographicFit: number
  // Removed costEffectiveness from weights
}

// Updated weighting matrices for 6-component scoring system (removed cost effectiveness)
const rankingWeights: Record<string, RankingWeights> = {
  hidden_gems: {
    growthMomentum: 0.30,    // Increased from 0.25
    fanEngagement: 0.30,     // Increased from 0.25
    digitalPopularity: 0.15,
    livePotential: 0.15,
    venueFit: 0.20,
    geographicFit: 0.10
    // Removed costEffectiveness: 0.10
  },
  genre_fit: {
    growthMomentum: 0.10,    // Increased from 0.08
    fanEngagement: 0.25,     // Increased from 0.22
    digitalPopularity: 0.05,
    livePotential: 0.20,     // Increased from 0.18
    venueFit: 0.40,          // Increased from 0.35
    geographicFit: 0.10      // Decreased from 0.12
    // Removed costEffectiveness: 0.10
  },
  proven_draw: {
    growthMomentum: 0.05,
    fanEngagement: 0.25,     // Increased from 0.20
    digitalPopularity: 0.25, // Increased from 0.20
    livePotential: 0.30,     // Increased from 0.25
    venueFit: 0.15,
    geographicFit: 0.15      // Increased from 0.10
    // Removed costEffectiveness: 0.15
  },
  local_buzz: {
    growthMomentum: 0.25,    // Increased from 0.20
    fanEngagement: 0.30,     // Increased from 0.25
    digitalPopularity: 0.05,
    livePotential: 0.10,
    venueFit: 0.30,          // Increased from 0.25
    geographicFit: 0.20      // Increased from 0.15
    // Removed costEffectiveness: 0.10
  },
  rising_stars: {
    growthMomentum: 0.40,    // Increased from 0.35
    fanEngagement: 0.20,     // Increased from 0.15
    digitalPopularity: 0.25, // Increased from 0.20
    livePotential: 0.10,
    venueFit: 0.05,
    geographicFit: 0.05      // Decreased from 0.05
    // Removed costEffectiveness: 0.10
  }
}

const applyWeightsToBands = (bands: Band[], focus: string): Band[] => {
  const weights = rankingWeights[focus]
  if (!weights) return bands

  return bands.map((band) => ({
    ...band,
    overallScore: Math.round(
      band.growthMomentumScore * weights.growthMomentum +
      band.fanEngagementScore * weights.fanEngagement +
      band.digitalPopularityScore * weights.digitalPopularity +
      band.livePotentialScore * weights.livePotential +
      band.venueFitScore * weights.venueFit +
      band.geographicFitScore * weights.geographicFit
      // Removed cost effectiveness from calculation
    )
  }))
}

// Performance Form Modal Component
const PerformanceFormModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  bandName: string
  bandId: string
  onSubmit: (data: PerformanceData) => void
}> = ({ isOpen, onClose, bandName, bandId, onSubmit }) => {
  const [formData, setFormData] = useState<PerformanceData>({
    overallVibe: 3,
    attendance: 0,
    bandBookingCost: 0,
    wouldBookAgain: 'Maybe',
    openingHeadliner: 'Opening'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Mark Band as Played</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Band Name */}
          <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700 font-medium">Recording performance for:</p>
            <p className="text-lg font-bold text-orange-900">{bandName}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Overall Vibe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Vibe (1-5 stars)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, overallVibe: rating }))}
                    className={`p-2 rounded-lg transition-colors ${
                      formData.overallVibe >= rating
                        ? 'text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <StarIcon className="h-6 w-6" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600 self-center">
                  {formData.overallVibe}/5
                </span>
              </div>
            </div>

            {/* Attendance */}
            <div>
              <label htmlFor="attendance" className="block text-sm font-medium text-gray-700 mb-1">
                Attendance (number of people)
              </label>
              <input
                type="number"
                id="attendance"
                value={formData.attendance || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, attendance: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter attendance count"
                required
              />
            </div>

            {/* Band Booking Cost */}
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Band Booking Cost ($)
              </label>
              <input
                type="number"
                id="cost"
                value={formData.bandBookingCost || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bandBookingCost: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter booking cost"
                required
              />
            </div>

            {/* Would Book Again */}
            <div>
              <label htmlFor="bookAgain" className="block text-sm font-medium text-gray-700 mb-1">
                Would Book Again?
              </label>
              <select
                id="bookAgain"
                value={formData.wouldBookAgain}
                onChange={(e) => setFormData(prev => ({ ...prev, wouldBookAgain: e.target.value as 'Yes' | 'No' | 'Maybe' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Maybe">Maybe</option>
              </select>
            </div>

            {/* Opening/Headliner */}
            <div>
              <label htmlFor="slot" className="block text-sm font-medium text-gray-700 mb-1">
                Opening or Headliner?
              </label>
              <select
                id="slot"
                value={formData.openingHeadliner}
                onChange={(e) => setFormData(prev => ({ ...prev, openingHeadliner: e.target.value as 'Opening' | 'Headliner' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Opening">Opening</option>
                <option value="Headliner">Headliner</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Submit Performance
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Band Removal Modal Component
const BandRemovalModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  bandName: string
  bandId: string
  onSubmit: (data: RemovalData) => void
}> = ({ isOpen, onClose, bandName, bandId, onSubmit }) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])

  const removalReasons = [
    'Not enough digital presence',
    'Not correct genre fit',
    'Band was unprofessional',
    'Too expensive for potential draw',
    'Geographic fit concerns',
    'Scheduling conflicts',
    'Changed business direction',
    'Other venue requirements'
  ]

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedReasons.length === 0) {
      alert('Please select at least one reason for removal.')
      return
    }
    onSubmit({ reasons: selectedReasons })
    onClose()
    setSelectedReasons([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Remove Band from List</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Band Name */}
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">Removing from inquiry list:</p>
            <p className="text-lg font-bold text-red-900">{bandName}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Removal Reasons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Why are you removing this band? (Select all that apply)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {removalReasons.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedReasons.includes(reason)}
                      onChange={() => toggleReason(reason)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Selected Reasons Summary */}
            {selectedReasons.length > 0 && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Selected reasons ({selectedReasons.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {selectedReasons.map((reason) => (
                    <span
                      key={reason}
                      className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove Band
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function BandInquiryDashboard() {
  const router = useRouter()
  const [refreshCountdown, setRefreshCountdown] = useState<number>(0)
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null)
  const [bands, setBands] = useState<Band[]>([])
  const [filteredBands, setFilteredBands] = useState<Band[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [rankingFocus, setRankingFocus] = useState<string>('hidden_gems')
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'followers'>('score')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  
  // Performance tracking states
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false)
  const [selectedBandForPerformance, setSelectedBandForPerformance] = useState<{ id: string, name: string } | null>(null)
  
  // Band removal states
  const [removalModalOpen, setRemovalModalOpen] = useState(false)
  const [selectedBandForRemoval, setSelectedBandForRemoval] = useState<{ id: string, name: string } | null>(null)

  // API URLs
  const RETRIEVE_DATA_API = '/api/bands'
  const REFRESH_DATA_API = '/api/bands/refresh'
  const BAND_ACTION_WEBHOOK_URL = 'https://thayneautomations.app.n8n.cloud/webhook/edit-band-status'

  // Handle performance form submission
  const handlePerformanceSubmit = async (performanceData: PerformanceData) => {
    if (!selectedBandForPerformance) return

    try {
      const payload = {
        bandId: selectedBandForPerformance.id,
        bandName: selectedBandForPerformance.name,
        bandAction: 'Yes',
        ...performanceData,
        datePerformed: new Date().toISOString(),
        venue: 'The Cowboy Saloon'
      }

      const response = await fetch(BAND_ACTION_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        // Remove the band from the inquiry list since it's now played
        setBands(prev => prev.filter(band => band.id !== selectedBandForPerformance.id))
        console.log('Performance data submitted successfully')
      } else {
        throw new Error('Failed to submit performance data')
      }
    } catch (error) {
      console.error('Error submitting performance data:', error)
      setError('Failed to submit performance data')
    }
  }

  // Handle band removal submission
  const handleRemovalSubmit = async (removalData: RemovalData) => {
    if (!selectedBandForRemoval) return

    try {
      const payload = {
        bandId: selectedBandForRemoval.id,
        bandName: selectedBandForRemoval.name,
        bandAction: 'Band Removed',
        removalReasons: removalData.reasons,
        dateRemoved: new Date().toISOString(),
        venue: 'The Cowboy Saloon'
      }

      const response = await fetch(BAND_ACTION_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        // Remove the band from the inquiry list since it's been rejected
        setBands(prev => prev.filter(band => band.id !== selectedBandForRemoval.id))
        console.log('Band removal data submitted successfully')
      } else {
        throw new Error('Failed to submit band removal data')
      }
    } catch (error) {
      console.error('Error submitting band removal data:', error)
      setError('Failed to submit band removal data')
    }
  }

  // Handle band status change
  const handleBandStatusChange = (bandId: string, bandName: string, status: string) => {
    if (status === 'Band Played') {
      setSelectedBandForPerformance({ id: bandId, name: bandName })
      setPerformanceModalOpen(true)
    } else if (status === 'Remove Band From List') {
      setSelectedBandForRemoval({ id: bandId, name: bandName })
      setRemovalModalOpen(true)
    }
  }

  // Improved helper function to safely extract values from complex Airtable objects
  const safeExtractValue = (field: any, fallback: any = null) => {
    if (field === null || field === undefined) return fallback
    
    if (typeof field === 'object' && field.state === 'error') {
      console.warn('Airtable field error:', field)
      return fallback
    }
    
    if (typeof field === 'object' && field.value !== undefined) {
      return field.value || fallback
    }
    
    if (Array.isArray(field)) {
      return field.length > 0 ? field[0] : fallback
    }
    
    return field
  }

  // Transform Airtable data to our Band interface with enhanced error handling
  const transformAirtableData = (airtableRecords: any[]): Band[] => {
    console.log('🔄 Transforming', airtableRecords.length, 'records')
    
    const transformedBands = airtableRecords
      .filter(record => {
        // FILTER OUT PLAYED BANDS - this is key for the inquiry page
        const hasPlayed = safeExtractValue(record['Has Played?'] || record.hasPlayed, 'No')
        return hasPlayed !== 'Yes'
      })
      .map((record: any, index: number) => {
        console.log(`🔄 Processing record ${index + 1}:`, record['Band Name'] || record.bandName || 'Unknown')
        
        const band = {
          id: record.id || record.recordId || Math.random().toString(36),
          name: safeExtractValue(record['Band Name'] || record.bandName, 'Unknown'),
          overallScore: 0, // Will be calculated by weights
          growthMomentumScore: Number(safeExtractValue(record['Growth Momentum Score'] || record.growthMomentumScore, 0)) || 0,
          fanEngagementScore: Number(safeExtractValue(record['Fan Engagement Score'] || record.fanEngagementScore, 0)) || 0,
          digitalPopularityScore: Number(safeExtractValue(record['Digital Popularity Score'] || record['Digital Popularity'] || record.digitalPopularityScore, 0)) || 0,
          livePotentialScore: Number(safeExtractValue(record['Live Potential Score'] || record.livePotentialScore, 0)) || 0,
          venueFitScore: Number(safeExtractValue(record['Venue Fit Score'] || record.venueFitScore, 0)) || 0,
          geographicFitScore: Number(safeExtractValue(record['Geographic Fit Score'] || record.geographicFitScore, 0)) || 0,
          costEffectivenessScore: Number(safeExtractValue(record['Cost Effectiveness Score'] || record.costEffectivenessScore, 0)) || 0,
          recommendation: safeExtractValue(record['Recommendation Level'] || record.recommendation, 'MAYBE') as 'BOOK SOON' | 'STRONG CONSIDER' | 'MAYBE' | 'PASS',
          spotifyFollowers: Number(safeExtractValue(record['Spotify Followers'] || record.spotifyFollowers, 0)) || 0,
          spotifyPopularity: Number(safeExtractValue(record['Spotify Popularity Score'] || record.spotifyPopularity, 0)) || 0,
          spotifyUrl: safeExtractValue(record['Spotify Profile URL'] || record.spotifyUrl, ''),
          youtubeSubscribers: Number(safeExtractValue(record['Youtube Subscribers'] || record.youtubeSubscribers, 0)) || 0,
          youtubeViews: Number(safeExtractValue(record['Youtube Views'] || record.youtubeViews, 0)) || 0,
          youtubeVideoCount: Number(safeExtractValue(record['Youtube Video Count'] || record.youtubeVideoCount, 0)) || 0,
          averageViewsPerVideo: Number(safeExtractValue(record['Average Views Per Video'] || record.averageViewsPerVideo, 0)) || 0,
          youtubeHasVevo: safeExtractValue(record['Youtube has VEVO'], 'false') === 'true' || safeExtractValue(record['Youtube has VEVO'], false) === true,
          aiCostEstimate: Number(safeExtractValue(record['AI Cost Estimate'] || record.aiCostEstimate, 0)) || undefined,
          estimatedDraw: safeExtractValue(record['Estimated Audience Draw'] || record.estimatedDraw, 'Unknown'),
          keyStrengths: safeExtractValue(record['Key Strengths'] || record.keyStrengths, 'No strengths identified yet'),
          mainConcerns: safeExtractValue(record['Main Concerns'] || record.mainConcerns, 'No concerns identified yet'),
          bookingStatus: safeExtractValue(record['Booking Status'] || record.bookingStatus, 'Not Contacted') as Band['bookingStatus'],
          lastUpdated: safeExtractValue(record['Last Updated'] || record.lastUpdated, new Date().toISOString()),
          dateAnalyzed: safeExtractValue(record['Date Analyzed'] || record.dateAnalyzed, new Date().toISOString()),
          confidenceLevel: safeExtractValue(record['Draw Confidence Level'] || record.confidenceLevel, 'Medium') as 'High' | 'Medium' | 'Low',
          aiAnalysisNotes: safeExtractValue(record['AI Analysis Notes'] || record.aiAnalysisNotes, 'No analysis notes available'),
          hasPlayed: safeExtractValue(record['Has Played?'] || record.hasPlayed, 'No') as 'Yes' | 'No'
        }
        
        console.log(`✅ Transformed band: ${band.name} (Score components: G:${band.growthMomentumScore}, F:${band.fanEngagementScore}, D:${band.digitalPopularityScore}, L:${band.livePotentialScore}, V:${band.venueFitScore}, Geo:${band.geographicFitScore})`)
        
        return band
      })
    
    console.log('🎯 Total transformed bands for inquiry:', transformedBands.length)
    return transformedBands
  }

  // Fetch band data from our API
  const fetchBandData = async () => {
    const requestId = Math.random().toString(36).substring(7)
    console.log(`🎯 [${requestId}] Starting fetchBandData`)
    
    try {
      setError(null)
      console.log(`📡 [${requestId}] Fetching from:`, RETRIEVE_DATA_API)
      
      const response = await fetch(RETRIEVE_DATA_API, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      console.log(`📨 [${requestId}] Response status:`, response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`📦 [${requestId}] Raw response type:`, typeof data)
      
      // Handle different possible response structures
      let records = []
      if (Array.isArray(data)) {
        records = data
        console.log(`✅ [${requestId}] Data is direct array`)
      } else if (data.records && Array.isArray(data.records)) {
        records = data.records
        console.log(`✅ [${requestId}] Data has records property`)
      } else if (data.data && Array.isArray(data.data)) {
        records = data.data
        console.log(`✅ [${requestId}] Data has data property`)
      } else {
        console.warn(`⚠️ [${requestId}] Unexpected data structure:`, data)
        console.log(`🔍 [${requestId}] Available keys:`, Object.keys(data))
        records = []
      }

      console.log(`📊 [${requestId}] Records found:`, records.length)
      console.log(`📊 [${requestId}] First record sample:`, records[0])

      const transformedBands = transformAirtableData(records)
      console.log(`🔄 [${requestId}] Transformed bands:`, transformedBands.length)
      console.log(`🔄 [${requestId}] First transformed band:`, transformedBands[0])

      // Apply current ranking focus weights
      const weightedBands = applyWeightsToBands(transformedBands, rankingFocus)
      setBands(weightedBands)

      // Set last refresh time to the most recent analysis date
      if (weightedBands.length > 0) {
        const mostRecent = weightedBands.reduce((latest, band) => {
          const bandDate = new Date(band.dateAnalyzed)
          const latestDate = new Date(latest)
          return bandDate > latestDate ? band.dateAnalyzed : latest
        }, weightedBands[0].dateAnalyzed)
        setLastRefresh(new Date(mostRecent))
        console.log(`⏰ [${requestId}] Last refresh set to:`, mostRecent)
      }

    } catch (error) {
      console.error(`💥 [${requestId}] Error in fetchBandData:`, error)
      console.error(`💥 [${requestId}] Error stack:`, (error as Error).stack)
      setError(`Failed to load band data: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
      console.log(`✅ [${requestId}] fetchBandData completed`)
    }
  }

  // Refresh band data
  const refreshBandData = async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      
      // Send the webhook but don't wait for it to complete
      fetch(REFRESH_DATA_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastRefresh: lastRefresh?.toISOString()
        })
      }).catch(error => {
        console.error('Webhook error (non-critical):', error)
      })
  
      // Start 4-minute countdown timer (240 seconds)
      setRefreshCountdown(240)
      
      const timer = setInterval(() => {
        setRefreshCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setRefreshTimer(null)
            setIsRefreshing(false)
            fetchBandData()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      setRefreshTimer(timer)
  
    } catch (error) {
      console.error('Error starting refresh:', error)
      setError('Failed to start refresh process')
      setIsRefreshing(false)
    }
  }
  
  // Cleanup function to clear timer if component unmounts
  useEffect(() => {
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
    }
  }, [refreshTimer])
  
  // Helper function to format countdown time
  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Load data on component mount
  useEffect(() => {
    console.log('🎯 Component mounted, calling fetchBandData')
    fetchBandData()
  }, [])

  // Recalculate overall scores when ranking focus changes
  useEffect(() => {
    setBands(prev => applyWeightsToBands(prev, rankingFocus))
  }, [rankingFocus])

  // Filter and sort bands
  useEffect(() => {
    let filtered = bands.filter(band => {
      const matchesSearch = band.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRecommendation = selectedRecommendation === 'all' || band.recommendation === selectedRecommendation
      const matchesStatus = selectedStatus === 'all' || band.bookingStatus === selectedStatus
      
      return matchesSearch && matchesRecommendation && matchesStatus
    })

    // Sort bands
    filtered.sort((a, b) => {
      if (sortBy === 'score') return b.overallScore - a.overallScore
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'followers') return b.spotifyFollowers - a.spotifyFollowers
      return 0
    })

    setFilteredBands(filtered)
  }, [bands, searchTerm, selectedRecommendation, selectedStatus, sortBy])

  // Toggle card expansion
  const toggleCardExpansion = (bandId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bandId)) {
        newSet.delete(bandId)
      } else {
        newSet.add(bandId)
      }
      return newSet
    })
  }

  // Update booking status
  const updateBookingStatus = (bandId: string, newStatus: Band['bookingStatus']) => {
    setBands(prev => prev.map(band => 
      band.id === bandId ? { ...band, bookingStatus: newStatus } : band
    ))
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'BOOK SOON': return 'bg-green-100 text-green-800 border-green-200'
      case 'STRONG CONSIDER': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'MAYBE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PASS': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Booked': return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'Passed': return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'Negotiating': return <ClockIcon className="h-5 w-5 text-yellow-500" />
      default: return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-orange-500 mx-auto"></div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mt-4">Loading Band Data...</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Fetching the latest artist analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition-colors touch-manipulation"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
              <div className="bg-orange-500 p-2 sm:p-3 rounded-lg">
                <SpeakerWaveIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Band Discovery</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">Smart booking decisions for The Cowboy Saloon</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              {lastRefresh && (
                <div className="text-xs sm:text-sm text-gray-500">
                  Last updated: {lastRefresh.toLocaleDateString()}
                </div>
              )}
              <div className="flex space-x-2 w-full sm:w-auto">
                <button
                  onClick={refreshBandData}
                  disabled={isRefreshing}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base touch-manipulation"
                >
                  <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing && refreshCountdown > 0 
                    ? `Refreshing... ${formatCountdown(refreshCountdown)}` 
                    : isRefreshing 
                      ? 'Refreshing...' 
                      : 'Refresh Data'}
                </button>
                <button
                  onClick={() => router.push('/financial')}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base touch-manipulation"
                >
                  <CalculatorIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                  Financial Analysis
                </button>
                <button
                  onClick={() => router.push('/bands/history')}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-manipulation"
                >
                  View History
                </button>
                <button
                  onClick={() => router.push('/bands/rejected')}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base touch-manipulation"
                >
                  Rejected Bands
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          
          {/* Mobile Filter Toggle */}
          <div className="block sm:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 font-medium"
            >
              <span className="flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters & Search
              </span>
              <ChevronDownIcon className={`h-5 w-5 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Container */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
            {/* Ranking Focus Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <AdjustmentsHorizontalIcon className="inline h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Ranking Focus
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                {rankingFocusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRankingFocus(option.value)}
                    className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all touch-manipulation ${
                      rankingFocus === option.value
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-lg sm:text-2xl mb-1 sm:mb-2">{option.icon}</div>
                    <div className="font-semibold text-xs sm:text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1 hidden sm:block">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bands..."
                  className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Recommendation Filter */}
              <select
                value={selectedRecommendation}
                onChange={(e) => setSelectedRecommendation(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">All Recommendations</option>
                <option value="BOOK SOON">Book Soon</option>
                <option value="STRONG CONSIDER">Strong Consider</option>
                <option value="MAYBE">Maybe</option>
                <option value="PASS">Pass</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">All Statuses</option>
                <option value="Not Contacted">Not Contacted</option>
                <option value="Contacted">Contacted</option>
                <option value="Negotiating">Negotiating</option>
                <option value="Booked">Booked</option>
                <option value="Passed">Passed</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'followers')}
                className="border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
                <option value="followers">Sort by Followers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-4 sm:gap-6">
          {filteredBands.map((band) => (
            <div key={band.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Main Card Content */}
              <div className="p-4 sm:p-6">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0 mb-4">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(band.bookingStatus)}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{band.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1 space-y-1 sm:space-y-0">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border w-fit ${getRecommendationColor(band.recommendation)}`}>
                          {band.recommendation}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">{band.bookingStatus}</span>
                      </div>
                      
                      {/* Band Status Dropdown */}
                      <div className="mt-2">
                        <select
                          onChange={(e) => handleBandStatusChange(band.id, band.name, e.target.value)}
                          className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                          defaultValue=""
                        >
                          <option value="" disabled>Change Band Status</option>
                          <option value="Remove Band From List">Remove Band From List</option>
                          <option value="Band Played">Band Played</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="text-center sm:text-right flex-shrink-0">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600">{band.overallScore}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Overall Score</div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-sm sm:text-lg font-semibold text-gray-900">{band.spotifyFollowers.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Spotify Followers</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-sm sm:text-lg font-semibold text-gray-900">{band.spotifyPopularity}/100</div>
                    <div className="text-xs text-gray-500">Spotify Popularity</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-sm sm:text-lg font-semibold text-gray-900">{band.youtubeSubscribers.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">YouTube Subscribers</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-sm sm:text-lg font-semibold text-gray-900">{band.estimatedDraw}</div>
                    <div className="text-xs text-gray-500">Est. Draw</div>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => toggleCardExpansion(band.id)}
                  className="w-full flex items-center justify-center space-x-2 py-2 sm:py-3 text-sm text-gray-600 hover:text-gray-800 border-t border-gray-200 touch-manipulation"
                >
                  <span>
                    {expandedCards.has(band.id) ? 'Hide Details' : 'Show Details'}
                  </span>
                  {expandedCards.has(band.id) ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Expanded Details - SIMPLIFIED WITHOUT FINANCIAL ANALYSIS */}
              {expandedCards.has(band.id) && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
                  
                  {/* Score Breakdown - 6 COMPONENTS */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Score Breakdown (6 Components)</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-semibold text-gray-900">{band.growthMomentumScore}</div>
                        <div className="text-xs text-gray-500">Growth</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-semibold text-gray-900">{band.fanEngagementScore}</div>
                        <div className="text-xs text-gray-500">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-semibold text-gray-900">{band.digitalPopularityScore}</div>
                        <div className="text-xs text-gray-500">Digital</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-semibold text-gray-900">{band.livePotentialScore}</div>
                        <div className="text-xs text-gray-500">Live</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-semibold text-gray-900">{band.venueFitScore}</div>
                        <div className="text-xs text-gray-500">Venue Fit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-semibold text-blue-600">{band.geographicFitScore}</div>
                        <div className="text-xs text-blue-500 font-medium">Geographic</div>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200">
                        <CalculatorIcon className="h-4 w-4 mr-1" />
                        <span>Use Financial Analysis tool for cost calculations</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional YouTube Stats */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">YouTube Analytics</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-gray-900">{band.youtubeViews.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Total Views</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-gray-900">{band.youtubeVideoCount}</div>
                        <div className="text-xs text-gray-500">Video Count</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-gray-900">{band.averageViewsPerVideo.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Avg Views/Video</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-gray-900">
                          {band.youtubeHasVevo ? '✓' : '✗'}
                        </div>
                        <div className="text-xs text-gray-500">VEVO Channel</div>
                      </div>
                    </div>
                  </div>

                  {/* Key Strengths & Concerns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Key Strengths</h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          {band.keyStrengths || 'No strengths identified yet'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Main Concerns</h4>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                          {band.mainConcerns || 'No concerns identified yet'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Notes */}
                  {band.aiAnalysisNotes && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">AI Analysis Notes</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{band.aiAnalysisNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions & Status */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      {band.spotifyUrl && (
                        <a
                          href={band.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors touch-manipulation"
                        >
                          <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                          Listen on Spotify
                        </a>
                      )}
                      <button
                        onClick={() => router.push('/financial')}
                        className="inline-flex items-center justify-center px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors touch-manipulation"
                      >
                        <CalculatorIcon className="h-4 w-4 mr-1" />
                        Analyze Costs
                      </button>
                      <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500 space-y-1 sm:space-y-0 sm:space-x-2">
                        <span>Confidence: {band.confidenceLevel}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Analyzed: {new Date(band.dateAnalyzed).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <select
                      value={band.bookingStatus}
                      onChange={(e) => updateBookingStatus(band.id, e.target.value as Band['bookingStatus'])}
                      className="w-full sm:w-auto text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="Not Contacted">Not Contacted</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Negotiating">Negotiating</option>
                      <option value="Booked">Booked</option>
                      <option value="Passed">Passed</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredBands.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <SpeakerWaveIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bands found</h3>
            <p className="mt-1 text-sm text-gray-500 px-4">
              {bands.length === 0 
                ? "No band data available. Try clicking 'Refresh Data' to scan for new bands."
                : "Try adjusting your search or filters."
              }
            </p>
          </div>
        )}

        {/* Stats Summary */}
        {filteredBands.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Discovery Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">{filteredBands.length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Available Bands</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {filteredBands.filter(b => b.recommendation === 'BOOK SOON').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Book Soon</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {filteredBands.filter(b => b.recommendation === 'STRONG CONSIDER').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Strong Consider</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-gray-600">
                  {filteredBands.filter(b => b.bookingStatus === 'Booked').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Booked</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Form Modal */}
      <PerformanceFormModal
        isOpen={performanceModalOpen}
        onClose={() => {
          setPerformanceModalOpen(false)
          setSelectedBandForPerformance(null)
        }}
        bandName={selectedBandForPerformance?.name || ''}
        bandId={selectedBandForPerformance?.id || ''}
        onSubmit={handlePerformanceSubmit}
      />

      {/* Band Removal Modal */}
      <BandRemovalModal
        isOpen={removalModalOpen}
        onClose={() => {
          setRemovalModalOpen(false)
          setSelectedBandForRemoval(null)
        }}
        bandName={selectedBandForRemoval?.name || ''}
        bandId={selectedBandForRemoval?.id || ''}
        onSubmit={handleRemovalSubmit}
      />
    </div>
  )
}
