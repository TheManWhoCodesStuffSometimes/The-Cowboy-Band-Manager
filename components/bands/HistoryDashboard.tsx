'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, FunnelIcon, SpeakerWaveIcon, ArrowPathIcon, ChevronDownIcon, ChevronUpIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { StarIcon, TrophyIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid'

interface Band {
  id: string
  name: string
  overallScore: number
  // Enhanced ranking metrics (0-100) - 7 components
  growthMomentumScore: number
  fanEngagementScore: number
  digitalPopularityScore: number
  livePotentialScore: number
  venueFitScore: number
  geographicFitScore: number
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
  aiAnalysisNotes: string
  // Performance tracking fields (required for history page)
  hasPlayed: 'Yes' | 'No'
  overallVibe?: number
  overallAttendance?: number
  bandBookingCost?: number
  wouldBookAgain?: 'Yes' | 'No' | 'Maybe'
  openerHeadliner?: 'Opening' | 'Headliner'
  mostRecentPerformanceDate?: string
}

export default function BandHistoryDashboard() {
  const router = useRouter()
  const [refreshCountdown, setRefreshCountdown] = useState<number>(0)
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null)
  const [bands, setBands] = useState<Band[]>([])
  const [filteredBands, setFilteredBands] = useState<Band[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVibeFilter, setSelectedVibeFilter] = useState<string>('all')
  const [selectedBookAgainFilter, setSelectedBookAgainFilter] = useState<string>('all')
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'vibe' | 'attendance' | 'name' | 'profitability'>('recent')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  // API URLs
  const RETRIEVE_DATA_API = '/api/bands'
  const REFRESH_DATA_API = '/api/bands/refresh'

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

  // Transform Airtable data - FILTER FOR PLAYED BANDS ONLY
  const transformAirtableData = (airtableRecords: any[]): Band[] => {
    console.log('🎭 Transforming', airtableRecords.length, 'records for history page')
    
    const transformedBands = airtableRecords
      .filter(record => {
        // FILTER FOR PLAYED BANDS ONLY - this is key for the history page
        const hasPlayed = safeExtractValue(record['Has Played?'] || record.hasPlayed, 'No')
        return hasPlayed === 'Yes'
      })
      .map((record: any, index: number) => {
        console.log(`🎭 Processing played band ${index + 1}:`, record['Band Name'] || record.bandName || 'Unknown')
        
        const band = {
          id: record.id || record.recordId || Math.random().toString(36),
          name: safeExtractValue(record['Band Name'] || record.bandName, 'Unknown'),
          overallScore: Number(safeExtractValue(record['Overall Score'] || record.overallScore, 0)) || 0,
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
          bookingStatus: safeExtractValue(record['Booking Status'] || record.bookingStatus, 'Booked') as Band['bookingStatus'],
          lastUpdated: safeExtractValue(record['Last Updated'] || record.lastUpdated, new Date().toISOString()),
          dateAnalyzed: safeExtractValue(record['Date Analyzed'] || record.dateAnalyzed, new Date().toISOString()),
          confidenceLevel: safeExtractValue(record['Draw Confidence Level'] || record.confidenceLevel, 'Medium') as 'High' | 'Medium' | 'Low',
          aiAnalysisNotes: safeExtractValue(record['AI Analysis Notes'] || record.aiAnalysisNotes, 'No analysis notes available'),
          // Performance tracking fields - these are the key data for history
          hasPlayed: 'Yes' as const,
          overallVibe: Number(safeExtractValue(record['Overall Vibe'] || record.overallVibe, 0)) || undefined,
          overallAttendance: Number(safeExtractValue(record['Overall Attendance'] || record.overallAttendance, 0)) || undefined,
          bandBookingCost: Number(safeExtractValue(record['Band Booking Cost'] || record.bandBookingCost, 0)) || undefined,
          wouldBookAgain: safeExtractValue(record['Would Book Again?'] || record.wouldBookAgain, undefined) as 'Yes' | 'No' | 'Maybe' | undefined,
          openerHeadliner: safeExtractValue(record['Opener/Headliner?'] || record.openerHeadliner, undefined) as 'Opening' | 'Headliner' | undefined,
          mostRecentPerformanceDate: safeExtractValue(record['Most Recent Performance Date'] || record.mostRecentPerformanceDate, undefined)
        }
        
        console.log(`✅ Transformed played band: ${band.name} (Vibe: ${band.overallVibe}, Attendance: ${band.overallAttendance}, Cost: $${band.bandBookingCost})`)
        
        return band
      })
    
    console.log('🎭 Total transformed played bands for history:', transformedBands.length)
    return transformedBands
  }

  // Calculate profitability score for sorting
  const calculateProfitability = (band: Band): number => {
    if (!band.overallAttendance || !band.bandBookingCost || band.bandBookingCost <= 0) return 0
    
    // Simple profitability calculation: attendance per dollar spent
    // Higher attendance per dollar = better profitability
    const attendancePerDollar = band.overallAttendance / band.bandBookingCost
    
    // Scale it to a 0-100 score (cap at reasonable max)
    return Math.min(attendancePerDollar * 10, 100)
  }

  // Fetch band data from our API
  const fetchBandData = async () => {
    const requestId = Math.random().toString(36).substring(7)
    console.log(`🎭 [${requestId}] Starting fetchBandData for history`)
    
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

      const transformedBands = transformAirtableData(records)
      console.log(`🔄 [${requestId}] Transformed history bands:`, transformedBands.length)

      setBands(transformedBands)

      // Set last refresh time to the most recent analysis date
      if (transformedBands.length > 0) {
        const mostRecent = transformedBands.reduce((latest, band) => {
          const bandDate = new Date(band.dateAnalyzed)
          const latestDate = new Date(latest)
          return bandDate > latestDate ? band.dateAnalyzed : latest
        }, transformedBands[0].dateAnalyzed)
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
    console.log('🎭 History component mounted, calling fetchBandData')
    fetchBandData()
  }, [])

  // Filter and sort bands
  useEffect(() => {
    let filtered = bands.filter(band => {
      const matchesSearch = band.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesVibe = selectedVibeFilter === 'all' || 
        (selectedVibeFilter === '5-star' && band.overallVibe === 5) ||
        (selectedVibeFilter === '4-star' && band.overallVibe === 4) ||
        (selectedVibeFilter === '3-star' && band.overallVibe === 3) ||
        (selectedVibeFilter === '1-2-star' && band.overallVibe && band.overallVibe <= 2)
      
      const matchesBookAgain = selectedBookAgainFilter === 'all' || band.wouldBookAgain === selectedBookAgainFilter
      
      const matchesSlot = selectedSlotFilter === 'all' || band.openerHeadliner === selectedSlotFilter
      
      return matchesSearch && matchesVibe && matchesBookAgain && matchesSlot
    })

    // Sort bands
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = a.mostRecentPerformanceDate ? new Date(a.mostRecentPerformanceDate).getTime() : 0
        const dateB = b.mostRecentPerformanceDate ? new Date(b.mostRecentPerformanceDate).getTime() : 0
        return dateB - dateA
      }
      if (sortBy === 'vibe') return (b.overallVibe || 0) - (a.overallVibe || 0)
      if (sortBy === 'attendance') return (b.overallAttendance || 0) - (a.overallAttendance || 0)
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'profitability') return calculateProfitability(b) - calculateProfitability(a)
      return 0
    })

    setFilteredBands(filtered)
  }, [bands, searchTerm, selectedVibeFilter, selectedBookAgainFilter, selectedSlotFilter, sortBy])

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

  const getVibeStars = (vibe?: number) => {
    if (!vibe) return '⭐ No rating'
    return '★'.repeat(vibe) + '☆'.repeat(5 - vibe) + ` (${vibe}/5)`
  }

  const getBookAgainColor = (bookAgain?: string) => {
    switch (bookAgain) {
      case 'Yes': return 'bg-green-100 text-green-800 border-green-200'
      case 'No': return 'bg-red-100 text-red-800 border-red-200'
      case 'Maybe': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getProfitabilityLabel = (band: Band): { label: string; color: string } => {
    const score = calculateProfitability(band)
    if (score >= 80) return { label: 'Highly Profitable', color: 'text-green-600' }
    if (score >= 60) return { label: 'Profitable', color: 'text-blue-600' }
    if (score >= 40) return { label: 'Break Even', color: 'text-yellow-600' }
    if (score >= 20) return { label: 'Low Profit', color: 'text-orange-600' }
    if (score > 0) return { label: 'Unprofitable', color: 'text-red-600' }
    return { label: 'No Data', color: 'text-gray-600' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-purple-500 mx-auto"></div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mt-4">Loading Performance History...</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Fetching past show data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-purple-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => router.push('/bands')}
                className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition-colors touch-manipulation"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
              <div className="bg-purple-500 p-2 sm:p-3 rounded-lg">
                <TrophyIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Performance History</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">Track past shows and rebooking decisions</p>
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
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base touch-manipulation"
                >
                  <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing && refreshCountdown > 0 
                    ? `Refreshing... ${formatCountdown(refreshCountdown)}` 
                    : isRefreshing 
                      ? 'Refreshing...' 
                      : 'Refresh Data'}
                </button>
                <button
                  onClick={() => router.push('/bands')}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base touch-manipulation"
                >
                  Discover Bands
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
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 font-medium"
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
            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bands..."
                  className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Vibe Rating Filter */}
              <select
                value={selectedVibeFilter}
                onChange={(e) => setSelectedVibeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">All Vibes</option>
                <option value="5-star">⭐⭐⭐⭐⭐ Amazing</option>
                <option value="4-star">⭐⭐⭐⭐ Great</option>
                <option value="3-star">⭐⭐⭐ Good</option>
                <option value="1-2-star">⭐⭐ Poor</option>
              </select>

              {/* Would Book Again Filter */}
              <select
                value={selectedBookAgainFilter}
                onChange={(e) => setSelectedBookAgainFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">Book Again?</option>
                <option value="Yes">✅ Yes</option>
                <option value="Maybe">🤔 Maybe</option>
                <option value="No">❌ No</option>
              </select>

              {/* Slot Filter */}
              <select
                value={selectedSlotFilter}
                onChange={(e) => setSelectedSlotFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">All Slots</option>
                <option value="Headliner">🎤 Headliner</option>
                <option value="Opening">🎵 Opening</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'vibe' | 'attendance' | 'name' | 'profitability')}
                className="border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="recent">📅 Most Recent</option>
                <option value="vibe">⭐ Best Vibe</option>
                <option value="attendance">👥 Highest Attendance</option>
                <option value="profitability">💰 Most Profitable</option>
                <option value="name">🔤 Band Name</option>
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
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <TrophyIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{band.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1 space-y-1 sm:space-y-0">
                        <span className="text-sm font-medium text-purple-600">
                          {getVibeStars(band.overallVibe)}
                        </span>
                        {band.wouldBookAgain && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border w-fit ${getBookAgainColor(band.wouldBookAgain)}`}>
                            Book again: {band.wouldBookAgain}
                          </span>
                        )}
                      </div>
                      
                      {/* Performance Date */}
                      {band.mostRecentPerformanceDate && (
                        <div className="mt-1 text-xs text-gray-500">
                          Last performed: {new Date(band.mostRecentPerformanceDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center sm:text-right flex-shrink-0">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                      {band.overallVibe ? `${band.overallVibe}/5` : 'N/A'}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">Vibe Rating</div>
                  </div>
                </div>

                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-sm sm:text-lg font-semibold text-blue-900">
                      {band.overallAttendance ? band.overallAttendance.toLocaleString() : 'N/A'}
                    </div>
                    <div className="text-xs text-blue-600">Attendance</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-sm sm:text-lg font-semibold text-green-900">
                      {band.bandBookingCost ? `${band.bandBookingCost.toLocaleString()}` : 'N/A'}
                    </div>
                    <div className="text-xs text-green-600">Booking Cost</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-sm sm:text-lg font-semibold text-purple-900">
                      {band.openerHeadliner || 'N/A'}
                    </div>
                    <div className="text-xs text-purple-600">Slot</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2 sm:p-3 text-center">
                    <div className={`text-sm sm:text-lg font-semibold ${getProfitabilityLabel(band).color}`}>
                      {band.overallAttendance && band.bandBookingCost ? 
                        Math.round(band.overallAttendance / band.bandBookingCost * 100) / 100 : 'N/A'}
                    </div>
                    <div className="text-xs text-yellow-600">People/$</div>
                  </div>
                </div>

                {/* Profitability Assessment */}
                {band.overallAttendance && band.bandBookingCost && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Profitability Assessment:</span>
                      <span className={`font-semibold ${getProfitabilityLabel(band).color}`}>
                        {getProfitabilityLabel(band).label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Cost per attendee: ${Math.round(band.bandBookingCost / band.overallAttendance)}
                    </div>
                  </div>
                )}

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

              {/* Expanded Details */}
              {expandedCards.has(band.id) && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
                  
                  {/* Performance Analysis Section */}
                  <div className="mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">🎭 Performance Analysis</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {/* Vibe vs Expected */}
                      <div className="text-center">
                        <div className="text-xs text-blue-700 mb-1">Audience Vibe</div>
                        <div className="text-lg font-semibold text-blue-900">
                          {band.overallVibe ? `${band.overallVibe}/5 ⭐` : 'No rating'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {band.overallVibe && band.overallVibe >= 4 ? 'Crowd loved it!' : 
                           band.overallVibe && band.overallVibe >= 3 ? 'Good response' :
                           band.overallVibe && band.overallVibe >= 2 ? 'Mixed reaction' :
                           band.overallVibe ? 'Poor reception' : 'Not rated'}
                        </div>
                      </div>
                      
                      {/* Attendance vs Expected */}
                      <div className="text-center">
                        <div className="text-xs text-blue-700 mb-1">Attendance vs Expected</div>
                        <div className="text-lg font-semibold text-blue-900">
                          {band.overallAttendance ? band.overallAttendance.toLocaleString() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600">
                          Expected: {band.estimatedDraw}
                        </div>
                      </div>
                      
                      {/* Cost Effectiveness */}
                      <div className="text-center">
                        <div className="text-xs text-blue-700 mb-1">Value Rating</div>
                        <div className={`text-lg font-semibold ${getProfitabilityLabel(band).color}`}>
                          {getProfitabilityLabel(band).label}
                        </div>
                        <div className="text-xs text-gray-600">
                          {band.overallAttendance && band.bandBookingCost ? 
                            `${Math.round(calculateProfitability(band))}/100` : 'No data'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Original Discovery Scores */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Original Discovery Scores</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-3">
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
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-semibold text-green-600">{band.costEffectivenessScore}</div>
                        <div className="text-xs text-green-500 font-medium">Cost Value</div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-sm text-gray-600">
                        Original Overall Score: <span className="font-semibold text-orange-600">{band.overallScore}</span>
                      </span>
                    </div>
                  </div>

                  {/* Social Media Stats */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Social Media Analytics</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-green-600">
                          {band.spotifyFollowers.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Spotify Followers</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-green-600">
                          {band.spotifyPopularity}/100
                        </div>
                        <div className="text-xs text-gray-500">Spotify Popularity</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-red-600">
                          {band.youtubeSubscribers.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">YouTube Subscribers</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-red-600">
                          {band.averageViewsPerVideo.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Avg Views/Video</div>
                      </div>
                    </div>
                  </div>

                  {/* Key Strengths & Concerns from Discovery */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Original Strengths</h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          {band.keyStrengths || 'No strengths identified yet'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Original Concerns</h4>
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
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Original AI Analysis</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{band.aiAnalysisNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
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
                      <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500 space-y-1 sm:space-y-0 sm:space-x-2">
                        <span>Confidence: {band.confidenceLevel}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Original Rec: {band.recommendation}</span>
                      </div>
                    </div>
                    
                    {band.wouldBookAgain === 'Yes' && (
                      <button
                        onClick={() => router.push('/bands')}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors touch-manipulation"
                      >
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        Consider Rebooking
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredBands.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <TrophyIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No performance history found</h3>
            <p className="mt-1 text-sm text-gray-500 px-4">
              {bands.length === 0 
                ? "No bands have played yet. Book some shows to start building your performance history!"
                : "Try adjusting your search or filters to see different results."
              }
            </p>
            <button
              onClick={() => router.push('/bands')}
              className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Discover New Bands
            </button>
          </div>
        )}

        {/* Stats Summary */}
        {filteredBands.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{filteredBands.length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Shows Played</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {filteredBands.filter(b => b.wouldBookAgain === 'Yes').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Book Again</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {Math.round(filteredBands.reduce((sum, b) => sum + (b.overallVibe || 0), 0) / filteredBands.length * 10) / 10 || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Avg Vibe</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                  {Math.round(filteredBands.reduce((sum, b) => sum + (b.overallAttendance || 0), 0) / filteredBands.length) || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Avg Attendance</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  ${Math.round(filteredBands.reduce((sum, b) => sum + (b.bandBookingCost || 0), 0) / filteredBands.length) || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Avg Cost</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
