'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, FunnelIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline'
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
  bookingStatus: 'New' | 'Contacted' | 'Negotiating' | 'Booked' | 'Declined'
  spotifyUrl?: string
  lastUpdated: string
  recentActivity: string
  industryBuzz: string
}

const mockBands: Band[] = [
  {
    id: '1',
    name: 'Jamie Hansen',
    overallScore: 87,
    recommendation: 'BOOK SOON',
    spotifyFollowers: 2834,
    spotifyPopularity: 34,
    estimatedDraw: '200-350',
    keyStrengths: 'Strong local following, consistent touring, great live reviews',
    concerns: 'Limited national exposure',
    bookingStatus: 'New',
    spotifyUrl: 'https://open.spotify.com/artist/example',
    lastUpdated: '2024-08-01',
    recentActivity: '2024 album release, active touring',
    industryBuzz: 'Featured in local music blog, radio play'
  },
  {
    id: '2',
    name: 'Bottomland',
    overallScore: 79,
    recommendation: 'STRONG CONSIDER',
    spotifyFollowers: 1567,
    spotifyPopularity: 28,
    estimatedDraw: '150-280',
    keyStrengths: 'Growing fanbase, strong social media presence',
    concerns: 'Newer act, less proven live experience',
    bookingStatus: 'New',
    lastUpdated: '2024-08-01',
    recentActivity: 'New single released June 2024',
    industryBuzz: 'Rising popularity on streaming platforms'
  },
  {
    id: '3',
    name: 'Tyler Halverson',
    overallScore: 72,
    recommendation: 'MAYBE',
    spotifyFollowers: 945,
    spotifyPopularity: 22,
    estimatedDraw: '100-200',
    keyStrengths: 'Authentic sound, dedicated core fanbase',
    concerns: 'Limited reach, inconsistent activity',
    bookingStatus: 'New',
    lastUpdated: '2024-08-01',
    recentActivity: 'Sporadic releases, local gigs',
    industryBuzz: 'Minimal press coverage'
  }
]

export default function BandDashboard() {
  const [bands, setBands] = useState<Band[]>(mockBands)
  const [filteredBands, setFilteredBands] = useState<Band[]>(mockBands)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'followers'>('score')

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
      case 'Declined': return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'Negotiating': return <ClockIcon className="h-5 w-5 text-yellow-500" />
      default: return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const updateBookingStatus = (bandId: string, newStatus: Band['bookingStatus']) => {
    setBands(bands.map(band => 
      band.id === bandId ? { ...band, bookingStatus: newStatus } : band
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="test-class">TEST - This should be red with white text</div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <SpeakerWaveIcon className="h-8 w-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">Band Manager</h1>
              <span className="text-sm text-gray-500">The Cowboy Saloon</span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Negotiating">Negotiating</option>
              <option value="Booked">Booked</option>
              <option value="Declined">Declined</option>
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
            Showing {filteredBands.length} of {bands.length} bands
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

                {/* Analysis */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="text-sm font-medium text-green-700 mb-1">Key Strengths</div>
                    <div className="text-sm text-gray-600">{band.keyStrengths}</div>
                  </div>
                  {band.concerns && (
                    <div>
                      <div className="text-sm font-medium text-yellow-700 mb-1">Concerns</div>
                      <div className="text-sm text-gray-600">{band.concerns}</div>
                    </div>
                  )}
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
                  </div>
                  
                  <select
                    value={band.bookingStatus}
                    onChange={(e) => updateBookingStatus(band.id, e.target.value as Band['bookingStatus'])}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Negotiating">Negotiating</option>
                    <option value="Booked">Booked</option>
                    <option value="Declined">Declined</option>
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
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
