'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, FunnelIcon, SpeakerWaveIcon, ArrowPathIcon, ChevronDownIcon, ChevronUpIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'

interface RejectedBand {
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
  // Rejection tracking fields (required for rejected page)
  hasBeenRejected: 'Yes' | 'No'
  rejectionReasons?: string[]
  dateRejected?: string
  rejectedBy?: string
}

export default function RejectedDashboard() {
  const router = useRouter()
  const [refreshCountdown, setRefreshCountdown] = useState<number>(0)
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null)
  const [bands, setBands] = useState<RejectedBand[]>([])
  const [filteredBands, setFilteredBands] = useState<RejectedBand[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'score' | 'followers'>('recent')
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

  // Transform Airtable data - FILTER FOR REJECTED BANDS ONLY
  const transformAirtableData = (airtableRecords: any[]): RejectedBand[] => {
    console.log('🚫 Transforming', airtableRecords.length, 'records for rejected page')
    
    const transformedBands = airtableRecords
      .filter(record => {
        // FILTER FOR REJECTED BANDS ONLY - check for "Band Removed" status
        const hasPlayedStatus = safeExtractValue(record['Has Played?'] || record.hasPlayed, 'No')
        return hasPlayedStatus === 'Band Removed'
      })
      .map((record: any, index: number) => {
        console.log(`🚫 Processing rejected band ${index + 1}:`, record['Band Name'] || record.bandName || 'Unknown')
        
        // Parse rejection reasons if they exist
        let rejectionReasons: string[] = []
        const reasonsField = safeExtractValue(record['Reasons for Removal'] || record.reasonsForRemoval || record.rejectionReasons, '')
        if (reasonsField) {
          try {
            // Handle both JSON array and comma-separated string formats
            if (typeof reasonsField === 'string') {
              if (reasonsField.startsWith('[') && reasonsField.endsWith(']')) {
                rejectionReasons = JSON.parse(reasonsField)
              } else {
                // Split by comma and clean up
                rejectionReasons = reasonsField.split(',').map(reason => reason.trim()).filter(Boolean)
              }
            } else if (Array.isArray(reasonsField)) {
              rejectionReasons = reasonsField
            }
          } catch (error) {
            console.warn('Error parsing rejection reasons:', error)
            rejectionReasons = reasonsField ? [reasonsField] : []
          }
        }
        
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
          bookingStatus: safeExtractValue(record['Booking Status'] || record.bookingStatus, 'Passed') as RejectedBand['bookingStatus'],
          lastUpdated: safeExtractValue(record['Last Updated'] || record.lastUpdated, new Date().toISOString()),
          dateAnalyzed: safeExtractValue(record['Date Analyzed'] || record.dateAnalyzed, new Date().toISOString()),
          confidenceLevel: safeExtractValue(record['Draw Confidence Level'] || record.confidenceLevel, 'Medium') as 'High' | 'Medium' | 'Low',
          // Rejection tracking fields - these are the key data for rejected bands
          hasBeenRejected: 'Yes' as const,
          rejectionReasons: rejectionReasons,
          dateRejected: safeExtractValue(record['Date Rejected'] || record.dateRejected || record['Date Analyzed'] || record.dateAnalyzed, undefined),
          rejectedBy: safeExtractValue(record['Rejected By'] || record.rejectedBy, 'The Cowboy Saloon')
        }
        
        console.log(`✅ Transformed rejected band: ${band.name} (Reasons: ${band.rejectionReasons?.join(', ') || 'No reasons'})`)
        
        return band
      })
    
    console.log('🚫 Total transformed rejected bands:', transformedBands.length)
    return transformedBands
  }

  // Fetch band data from our API
  const fetchBandData = async () => {
    const requestId = Math.random().toString(36).substring(7)
    console.log(`🚫 [${requestId}] Starting fetchBandData for rejected bands`)
    
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
      console.log(`🔄 [${requestId}] Transformed rejected bands:`, transformedBands.length)

      setBands(transformedBands)

      // Set last refresh time to the most recent rejection date
      if (transformedBands.length > 0) {
        const mostRecent = transformedBands.reduce((latest, band) => {
          const bandDate = band.dateRejected ? new Date(band.dateRejected) : new Date(band.dateAnalyzed)
          const latestDate = new Date(latest)
          return bandDate > latestDate ? (band.dateRejected || band.dateAnalyzed) : latest
        }, transformedBands[0].dateRejected || transformedBands[0].dateAnalyzed)
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
    console.log('🚫 Rejected component mounted, calling fetchBandData')
    fetchBandData()
  }, [])

  // Filter and sort bands
  useEffect(() => {
    let filtered = bands.filter(band => {
      const matchesSearch = band.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesReason = selectedReasonFilter === 'all' || 
        (band.rejectionReasons && band.rejectionReasons.some(reason => 
          reason.toLowerCase().includes(selectedReasonFilter.toLowerCase())
        ))
      
      return matchesSearch && matchesReason
    })

    // Sort bands
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = a.dateRejected ? new Date(a.dateRejected).getTime() : 0
        const dateB = b.dateRejected ? new Date(b.dateRejected).getTime() : 0
        return dateB - dateA
      }
      if (sortBy === 'score') return b.overallScore - a.overallScore
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'followers') return b.spotifyFollowers - a.spotifyFollowers
      return 0
    })

    setFilteredBands(filtered)
  }, [bands, searchTerm, selectedReasonFilter, sortBy])

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

  // Get all unique rejection reasons for filter dropdown
  const getAllRejectionReasons = (): string[] => {
    const reasonsSet = new Set<string>()
    bands.forEach(band => {
      if (band.rejectionReasons) {
        band.rejectionReasons.forEach(reason => reasonsSet.add(reason))
      }
    })
    return Array.from(reasonsSet).sort()
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-red-500 mx-auto"></div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mt-4">Loading Rejected Bands...</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Fetching bands that didn't make the cut</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => router.push('/bands')}
                className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition-colors touch-manipulation"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
              <div className="bg-red-500 p-2 sm:p-3 rounded-lg">
                <XCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Rejected Bands</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">Bands removed from consideration</p>
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
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base touch-manipulation"
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
                <button
                  onClick={() => router.push('/bands/history')}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-manipulation"
                >
                  View History
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
              className="w-full flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bands..."
                  className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Rejection Reason Filter */}
              <select
                value={selectedReasonFilter}
                onChange={(e) => setSelectedReasonFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">All Rejection Reasons</option>
                {getAllRejectionReasons().map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'score' | 'followers')}
                className="border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="recent">📅 Most Recently Rejected</option>
                <option value="score">🎯 Highest Score</option>
                <option value="name">🔤 Band Name</option>
                <option value="followers">👥 Most Followers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-4 sm:gap-6">
          {filteredBands.map((band) => (
            <div key={band.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-l-4 border-red-500">
              {/* Main Card Content */}
              <div className="p-4 sm:p-6">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{band.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1 space-y-1 sm:space-y-0">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border w-fit ${getRecommendationColor(band.recommendation)}`}>
                          Original: {band.recommendation}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200 w-fit">
                          REJECTED
                        </span>
                      </div>
                      
                      {/* Rejection Date */}
                      {band.dateRejected && (
                        <div className="mt-1 text-xs text-gray-500">
                          Rejected: {new Date(band.dateRejected).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center sm:text-right flex-shrink-0">
                    <div className="text-2xl sm:text-3xl font-bold text-red-600">{band.overallScore}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Original Score</div>
                  </div>
                </div>

                {/* Rejection Reasons */}
                {band.rejectionReasons && band.rejectionReasons.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-900 mb-2">Rejection Reasons:</h4>
                    <div className="flex flex-wrap gap-2">
                      {band.rejectionReasons.map((reason, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full border border-red-300"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

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
                    <div className="text-sm sm:text-lg font-semibold text-gray-900">{band.averageViewsPerVideo.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Avg Views/Video</div>
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

              {/* Expanded Details */}
              {expandedCards.has(band.id) && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
                  
                  {/* Rejection Analysis Section */}
                  <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-900 mb-3">🚫 Rejection Analysis</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {/* Rejection Date */}
                      <div className="text-center">
                        <div className="text-xs text-red-700 mb-1">Date Rejected</div>
                        <div className="text-lg font-semibold text-red-900">
                          {band.dateRejected ? new Date(band.dateRejected).toLocaleDateString() : 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {band.dateRejected ? 
                            `${Math.floor((Date.now() - new Date(band.dateRejected).getTime()) / (1000 * 60 * 60 * 24))} days ago` : 
                            'Date not available'}
                        </div>
                      </div>
                      
                      {/* Rejected By */}
                      <div className="text-center">
                        <div className="text-xs text-red-700 mb-1">Rejected By</div>
                        <div className="text-lg font-semibold text-red-900">
                          {band.rejectedBy || 'The Cowboy Saloon'}
                        </div>
                        <div className="text-xs text-gray-600">Decision maker</div>
                      </div>
                      
                      {/* Number of Reasons */}
                      <div className="text-center">
                        <div className="text-xs text-red-700 mb-1">Rejection Factors</div>
                        <div className="text-lg font-semibold text-red-900">
                          {band.rejectionReasons?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">
                          {band.rejectionReasons?.length === 1 ? 'reason cited' : 'reasons cited'}
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

                  {/* Additional YouTube Stats */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Analytics</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-gray-900">{band.youtubeViews.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Total YouTube Views</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-gray-900">{band.youtubeVideoCount}</div>
                        <div className="text-xs text-gray-500">Video Count</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-gray-900">{band.estimatedDraw}</div>
                        <div className="text-xs text-gray-500">Est. Draw</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm sm:text-lg font-semibold text-gray-900">
                          {band.youtubeHasVevo ? '✓' : '✗'}
                        </div>
                        <div className="text-xs text-gray-500">VEVO Channel</div>
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
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          {band.mainConcerns || 'No concerns identified yet'}
                        </p>
                      </div>
                    </div>
                  </div>

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
                        <span className="hidden sm:inline">•</span>
                        <span>Originally Analyzed: {new Date(band.dateAnalyzed).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-red-600 font-medium">
                      Status: REJECTED
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredBands.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <XCircleIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rejected bands found</h3>
            <p className="mt-1 text-sm text-gray-500 px-4">
              {bands.length === 0 
                ? "No bands have been rejected yet. Bands removed from consideration will appear here."
                : "Try adjusting your search or filters to see different results."
              }
            </p>
            <button
              onClick={() => router.push('/bands')}
              className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Discover New Bands
            </button>
          </div>
        )}

        {/* Stats Summary */}
        {filteredBands.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Rejection Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-red-600">{filteredBands.length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Rejected Bands</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">
                  {getAllRejectionReasons().length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Unique Reasons</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {Math.round(filteredBands.reduce((sum, b) => sum + b.overallScore, 0) / filteredBands.length) || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Avg Score</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {filteredBands.filter(b => b.recommendation === 'BOOK SOON' || b.recommendation === 'STRONG CONSIDER').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">High Potential</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
