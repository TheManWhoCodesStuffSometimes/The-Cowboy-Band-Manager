'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, FunnelIcon, SpeakerWaveIcon, ArrowPathIcon, AdjustmentsHorizontalIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon, ClockIcon, StarIcon } from '@heroicons/react/24/solid'

interface Band {
  id: string
  name: string
  overallScore: number
  // Raw ranking metrics (0-100)
  growthMomentumScore: number
  fanEngagementScore: number
  digitalPopularityScore: number
  livePotentialScore: number
  venueFitScore: number
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
  keyStrengths: string
  mainConcerns: string
  bookingStatus: 'Not Contacted' | 'Contacted' | 'Negotiating' | 'Booked' | 'Passed'
  lastUpdated: string
  dateAnalyzed: string
  confidenceLevel: 'High' | 'Medium' | 'Low'
  aiAnalysisNotes: string
}

interface RankingFocus {
  value: string
  label: string
  description: string
  icon: string
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
}

// Weighting matrices for each ranking focus. Values should total 1.0.
const rankingWeights: Record<string, RankingWeights> = {
  hidden_gems: {
    growthMomentum: 0.35,
    fanEngagement: 0.25,
    digitalPopularity: 0.15,
    livePotential: 0.10,
    venueFit: 0.15
  },
  genre_fit: {
    growthMomentum: 0.10,
    fanEngagement: 0.20,
    digitalPopularity: 0.05,
    livePotential: 0.15,
    venueFit: 0.50
  },
  proven_draw: {
    growthMomentum: 0.10,
    fanEngagement: 0.20,
    digitalPopularity: 0.30,
    livePotential: 0.35,
    venueFit: 0.05
  },
  local_buzz: {
    growthMomentum: 0.20,
    fanEngagement: 0.30,
    digitalPopularity: 0.05,
    livePotential: 0.10,
    venueFit: 0.35
  },
  rising_stars: {
    growthMomentum: 0.45,
    fanEngagement: 0.15,
    digitalPopularity: 0.25,
    livePotential: 0.10,
    venueFit: 0.05
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
      band.venueFitScore * weights.venueFit
    )
  }))
}

export default function BandDashboard() {
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

  // Internal API URLs (no CORS issues)
  const RETRIEVE_DATA_API = '/api/bands'
  const REFRESH_DATA_API = '/api/bands/refresh'

  // Helper function to safely extract values from complex Airtable objects
  const safeExtractValue = (field: any, fallback: any = null) => {
    if (field === null || field === undefined) return fallback
    if (typeof field === 'object' && field.value !== undefined) return field.value || fallback
    if (typeof field === 'object' && field.state === 'error') return fallback
    return field
  }

  // Transform Airtable data to our Band interface
  const transformAirtableData = (airtableRecords: any[]): Band[] => {
    return airtableRecords.map((record: any) => ({
      id: record.id || record.recordId || Math.random().toString(36),
      name: safeExtractValue(record['Band Name'] || record.bandName, 'Unknown'),
      overallScore: 0, // Will be calculated by weights
      growthMomentumScore: safeExtractValue(record['Growth Momentum Score'] || record.growthMomentumScore, 0),
      fanEngagementScore: safeExtractValue(record['Fan Engagement Score'] || record.fanEngagementScore, 0),
      digitalPopularityScore: safeExtractValue(record['Digital Popularity Score'] || record['Digital Popularity'] || record.digitalPopularityScore, 0),
      livePotentialScore: safeExtractValue(record['Live Potential Score'] || record.livePotentialScore, 0),
      venueFitScore: safeExtractValue(record['Venue Fit Score'] || record.venueFitScore, 0),
      recommendation: safeExtractValue(record['Recommendation Level'] || record.recommendation, 'MAYBE'),
      spotifyFollowers: safeExtractValue(record['Spotify Followers'] || record.spotifyFollowers, 0),
      spotifyPopularity: safeExtractValue(record['Spotify Popularity Score'] || record.spotifyPopularity, 0),
      spotifyUrl: safeExtractValue(record['Spotify Profile URL'] || record.spotifyUrl, ''),
      youtubeSubscribers: safeExtractValue(record['Youtube Subscribers'] || record.youtubeSubscribers, 0),
      youtubeViews: safeExtractValue(record['Youtube Views'] || record.youtubeViews, 0),
      youtubeVideoCount: safeExtractValue(record['Youtube Video Count'] || record.youtubeVideoCount, 0),
      averageViewsPerVideo: safeExtractValue(record['Average Views Per Video'] || record.averageViewsPerVideo, 0),
      youtubeHasVevo: safeExtractValue(record['Youtube has VEVO'], 'false') === 'true' || safeExtractValue(record['Youtube has VEVO'], false) === true,
      estimatedDraw: safeExtractValue(record['Estimated Audience Draw'] || record.estimatedDraw, 'Unknown'),
      keyStrengths: safeExtractValue(record['Key Strengths'] || record.keyStrengths, ''),
      mainConcerns: safeExtractValue(record['Main Concerns'] || record.mainConcerns, ''),
      bookingStatus: safeExtractValue(record['Booking Status'] || record.bookingStatus, 'Not Contacted'),
      lastUpdated: safeExtractValue(record['Last Updated'] || record.lastUpdated, new Date().toISOString()),
      dateAnalyzed: safeExtractValue(record['Date Analyzed'] || record.dateAnalyzed, new Date().toISOString()),
      confidenceLevel: safeExtractValue(record['Draw Confidence Level'] || record.confidenceLevel, 'Medium'),
      aiAnalysisNotes: safeExtractValue(record['AI Analysis Notes'] || record.aiAnalysisNotes, '')
    }))
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

  // Refresh data - trigger the full analysis workflow
  const refreshBandData = async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      const response = await fetch(REFRESH_DATA_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastRefresh: lastRefresh?.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // After refresh completes, fetch the updated data
      await fetchBandData()
      setLastRefresh(new Date())
      
      // Show success message if new bands were found
      if (result.newBandsFound && result.newBandsFound > 0) {
        console.log(`Refresh complete! Found ${result.newBandsFound} new bands.`)
      }

    } catch (error) {
      console.error('Error refreshing data:', error)
      setError('Failed to refresh data. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Loading Band Data...</h2>
          <p className="text-gray-600 mt-2">Fetching the latest artist analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-500 p-3 rounded-lg">
                <SpeakerWaveIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cowboy Band Manager</h1>
                <p className="text-gray-600">Smart booking decisions for The Cowboy Saloon</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {lastRefresh && (
                <div className="text-sm text-gray-500">
                  Last updated: {lastRefresh.toLocaleDateString()}
                </div>
              )}
              <button
                onClick={refreshBandData}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Ranking Focus Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <AdjustmentsHorizontalIcon className="inline h-5 w-5 mr-2" />
              Ranking Focus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {rankingFocusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRankingFocus(option.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    rankingFocus === option.value
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bands..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Recommendation Filter */}
            <select
              value={selectedRecommendation}
              onChange={(e) => setSelectedRecommendation(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="followers">Sort by Followers</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-6">
          {filteredBands.map((band) => (
            <div key={band.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Main Card Content */}
              <div className="p-6">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(band.bookingStatus)}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{band.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRecommendationColor(band.recommendation)}`}>
                          {band.recommendation}
                        </span>
                        <span className="text-sm text-gray-500">{band.bookingStatus}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600">{band.overallScore}</div>
                    <div className="text-sm text-gray-500">Overall Score</div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{band.spotifyFollowers.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Spotify Followers</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{band.spotifyPopularity}/100</div>
                    <div className="text-xs text-gray-500">Spotify Popularity</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{band.youtubeSubscribers.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">YouTube Subscribers</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{band.averageViewsPerVideo.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Avg Views/Video</div>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => toggleCardExpansion(band.id)}
                  className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-gray-600 hover:text-gray-800 border-t border-gray-200"
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
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  {/* Ranking Scores */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Ranking Scores</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-semibold text-gray-900">{band.growthMomentumScore}</div>
                        <div className="text-xs text-gray-500">Growth Momentum</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-gray-900">{band.fanEngagementScore}</div>
                        <div className="text-xs text-gray-500">Fan Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-gray-900">{band.digitalPopularityScore}</div>
                        <div className="text-xs text-gray-500">Digital Popularity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-gray-900">{band.livePotentialScore}</div>
                        <div className="text-xs text-gray-500">Live Potential</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-gray-900">{band.venueFitScore}</div>
                        <div className="text-xs text-gray-500">Venue Fit</div>
                      </div>
                    </div>
                  </div>

                  {/* Additional YouTube Stats */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">YouTube Analytics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-lg font-semibold text-gray-900">{band.youtubeViews.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Total Views</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-lg font-semibold text-gray-900">{band.youtubeVideoCount}</div>
                        <div className="text-xs text-gray-500">Video Count</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-lg font-semibold text-gray-900">{band.estimatedDraw}</div>
                        <div className="text-xs text-gray-500">Est. Draw</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {band.youtubeHasVevo ? '✓' : '✗'}
                        </div>
                        <div className="text-xs text-gray-500">VEVO Channel</div>
                      </div>
                    </div>
                  </div>

                  {/* Key Strengths & Concerns */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
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
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      {band.spotifyUrl && (
                        <a
                          href={band.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                        >
                          <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                          Listen on Spotify
                        </a>
                      )}
                      <span className="text-xs text-gray-500">
                        Confidence: {band.confidenceLevel}
                      </span>
                      <span className="text-xs text-gray-500">
                        Analyzed: {new Date(band.dateAnalyzed).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <select
                      value={band.bookingStatus}
                      onChange={(e) => updateBookingStatus(band.id, e.target.value as Band['bookingStatus'])}
                      className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
          <div className="text-center py-12">
            <SpeakerWaveIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bands found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {bands.length === 0 
                ? "No band data available. Try clicking 'Refresh Data' to scan for new bands."
                : "Try adjusting your search or filters."
              }
            </p>
          </div>
        )}

        {/* Stats Summary */}
        {filteredBands.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{filteredBands.length}</div>
                <div className="text-sm text-gray-500">Total Bands</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredBands.filter(b => b.recommendation === 'BOOK SOON').length}
                </div>
                <div className="text-sm text-gray-500">Book Soon</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredBands.filter(b => b.recommendation === 'STRONG CONSIDER').length}
                </div>
                <div className="text-sm text-gray-500">Strong Consider</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {filteredBands.filter(b => b.bookingStatus === 'Booked').length}
                </div>
                <div className="text-sm text-gray-500">Booked</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
