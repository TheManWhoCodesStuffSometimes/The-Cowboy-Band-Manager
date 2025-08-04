'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, FunnelIcon, SpeakerWaveIcon, ArrowPathIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon, ClockIcon, StarIcon } from '@heroicons/react/24/solid'

interface Band {
  id: string
  name: string
  overallScore: number
  recommendation: 'BOOK SOON' | 'STRONG CONSIDER' | 'MAYBE' | 'PASS'
  spotifyFollowers: number
  spotifyPopularity: number
  estimatedDraw: string
  keyStrengths: string
  concerns: string
  bookingStatus: 'Not Contacted' | 'Contacted' | 'Negotiating' | 'Booked' | 'Passed'
  spotifyUrl?: string
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

  // Internal API URLs (no CORS issues)
  const RETRIEVE_DATA_API = '/api/bands'
  const REFRESH_DATA_API = '/api/bands/refresh'

  // Transform Airtable data to our Band interface
  const transformAirtableData = (airtableRecords: any[]): Band[] => {
    return airtableRecords.map((record: any) => ({
      id: record.id || record.recordId || Math.random().toString(36),
      name: record['Band Name'] || record.bandName || 'Unknown',
      overallScore: record['Overall Booking Score'] || record.overallScore || 0,
      recommendation: record['Recommendation Level'] || record.recommendation || 'MAYBE',
      spotifyFollowers: record['Spotify Followers'] || record.spotifyFollowers || 0,
      spotifyPopularity: record['Spotify Popularity Score'] || record.spotifyPopularity || 0,
      estimatedDraw: record['Estimated Audience Draw'] || record.estimatedDraw || 'Unknown',
      keyStrengths: extractKeyStrengths(record['AI Analysis Notes'] || record.aiAnalysisNotes || ''),
      concerns: extractConcerns(record['AI Analysis Notes'] || record.aiAnalysisNotes || ''),
      bookingStatus: record['Booking Status'] || record.bookingStatus || 'Not Contacted',
      spotifyUrl: record['Spotify Profile URL'] || record.spotifyUrl || '',
      lastUpdated: record['Last Updated'] || record.lastUpdated || new Date().toISOString(),
      dateAnalyzed: record['Date Analyzed'] || record.dateAnalyzed || new Date().toISOString(),
      confidenceLevel: record['Draw Confidence Level'] || record.confidenceLevel || 'Medium',
      aiAnalysisNotes: record['AI Analysis Notes'] || record.aiAnalysisNotes || ''
    }))
  }

  // Helper functions to extract key strengths and concerns from AI notes
  const extractKeyStrengths = (notes: string): string => {
    // Try to extract positive aspects from the AI analysis notes
    if (notes.includes('solid momentum') || notes.includes('good follower') || notes.includes('strong')) {
      return notes.split('.')[0] + '.'
    }
    return 'Analysis pending'
  }

  const extractConcerns = (notes: string): string => {
    // Try to extract concerns from the AI analysis notes
    if (notes.includes('lack of') || notes.includes('limited') || notes.includes('concern')) {
      const sentences = notes.split('.')
      const concernSentence = sentences.find(s => 
        s.toLowerCase().includes('lack of') || 
        s.toLowerCase().includes('limited') || 
        s.toLowerCase().includes('concern')
      )
      return concernSentence ? concernSentence.trim() + '.' : ''
    }
    return ''
  }

  // Fetch initial data from Airtable
  const fetchBandData = async () => {
    try {
      setError(null)
      const response = await fetch(RETRIEVE_DATA_API, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Handle different possible response structures
      let records = []
      if (Array.isArray(data)) {
        records = data
      } else if (data.records && Array.isArray(data.records)) {
        records = data.records
      } else if (data.data && Array.isArray(data.data)) {
        records = data.data
      } else {
        console.warn('Unexpected data structure:', data)
        records = []
      }

      const transformedBands = transformAirtableData(records)
      setBands(transformedBands)
      
      // Set last refresh time to the most recent analysis date
      if (transformedBands.length > 0) {
        const mostRecent = transformedBands.reduce((latest, band) => {
          const bandDate = new Date(band.dateAnalyzed)
          const latestDate = new Date(latest)
          return bandDate > latestDate ? band.dateAnalyzed : latest
        }, transformedBands[0].dateAnalyzed)
        setLastRefresh(new Date(mostRecent))
      }

    } catch (error) {
      console.error('Error fetching band data:', error)
      setError('Failed to load band data. Please try refreshing.')
    } finally {
      setIsLoading(false)
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
          lastRefresh: lastRefresh?.toISOString(),
          rankingFocus: rankingFocus // Send current ranking focus to backend
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
        // You could add a toast notification here
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
    fetchBandData()
  }, [])

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
      default: return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const updateBookingStatus = async (bandId: string, newStatus: Band['bookingStatus']) => {
    // Optimistically update the UI
    setBands(bands.map(band => 
      band.id === bandId ? { ...band, bookingStatus: newStatus } : band
    ))

    // TODO: You could add an API call here to update the status in Airtable
    // For now, this only updates the local state
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Less than an hour ago'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString()
  }

  const getCurrentFocusOption = () => {
    return rankingFocusOptions.find(option => option.value === rankingFocus) || rankingFocusOptions[0]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="mx-auto h-12 w-12 text-orange-600 animate-spin" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading band data...</h3>
          <p className="mt-1 text-sm text-gray-500">Fetching latest information from database</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <SpeakerWaveIcon className="h-8 w-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">Band Manager</h1>
              <span className="text-sm text-gray-500">The Cowboy Saloon</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Current Ranking Focus Display */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 rounded-md border border-orange-200">
                <AdjustmentsHorizontalIcon className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">
                  {getCurrentFocusOption().icon} {getCurrentFocusOption().label}
                </span>
              </div>
              
              {/* Last Refresh Info */}
              <div className="text-sm text-gray-500">
                {lastRefresh ? (
                  <span>Last refresh: {formatTimeAgo(lastRefresh)}</span>
                ) : (
                  <span>No refresh data available</span>
                )}
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={refreshBandData}
                disabled={isRefreshing}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  isRefreshing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                } transition-colors`}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Status */}
        {isRefreshing && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <ArrowPathIcon className="h-5 w-5 text-blue-400 animate-spin" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Refreshing Data</h3>
                <div className="mt-2 text-sm text-blue-700">
                  Scanning emails, analyzing new bands with "{getCurrentFocusOption().label}" focus, and updating database...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ranking Focus Selector */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Ranking Focus</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {rankingFocusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setRankingFocus(option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                  rankingFocus === option.value
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className={`font-medium text-sm ${
                    rankingFocus === option.value ? 'text-orange-700' : 'text-gray-900'
                  }`}>
                    {option.label}
                  </span>
                </div>
                <p className={`text-xs ${
                  rankingFocus === option.value ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bands..."
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Recommendation Filter */}
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={selectedRecommendation}
              onChange={(e) => setSelectedRecommendation(e.target.value)}
            >
              <option value="all">All Recommendations</option>
              <option value="BOOK SOON">Book Soon</option>
              <option value="STRONG CONSIDER">Strong Consider</option>
              <option value="MAYBE">Maybe</option>
              <option value="PASS">Pass</option>
            </select>

            {/* Status Filter */}
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="followers">Sort by Followers</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredBands.length} of {bands.length} bands ranked by <strong>{getCurrentFocusOption().label}</strong> criteria
          </p>
        </div>

        {/* Band Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBands.map((band) => (
            <div key={band.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{band.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRecommendationColor(band.recommendation)}`}>
                        {band.recommendation}
                      </span>
                      {getStatusIcon(band.bookingStatus)}
                      <span className="text-sm text-gray-500">{band.bookingStatus}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{band.overallScore}</div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{band.spotifyFollowers.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Spotify Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{band.spotifyPopularity}/100</div>
                    <div className="text-xs text-gray-500">Popularity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{band.estimatedDraw}</div>
                    <div className="text-xs text-gray-500">Est. Draw</div>
                  </div>
                </div>

                {/* AI Analysis Notes */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">AI Analysis</div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {band.aiAnalysisNotes || 'No analysis available'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    {band.spotifyUrl && (
                      <a
                        href={band.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                      >
                        <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                        Listen
                      </a>
                    )}
                    <span className="text-xs text-gray-400">
                      Confidence: {band.confidenceLevel}
                    </span>
                  </div>
                  
                  <select
                    value={band.bookingStatus}
                    onChange={(e) => updateBookingStatus(band.id, e.target.value as Band['bookingStatus'])}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Not Contacted">Not Contacted</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Negotiating">Negotiating</option>
                    <option value="Booked">Booked</option>
                    <option value="Passed">Passed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  )
}
