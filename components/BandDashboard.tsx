 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/components/BandDashboard.tsx b/components/BandDashboard.tsx
index 6029e8801cec342ba3c37b763a374fe0db106408..b19d1c98f0d2a2a5d03ee77dd4d100d77e444276 100644
--- a/components/BandDashboard.tsx
+++ b/components/BandDashboard.tsx
@@ -1,112 +1,186 @@
 'use client'
 
 import { useState, useEffect } from 'react'
 import { MagnifyingGlassIcon, FunnelIcon, SpeakerWaveIcon, ArrowPathIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
 import { CheckCircleIcon, XCircleIcon, ClockIcon, StarIcon } from '@heroicons/react/24/solid'
 
 interface Band {
   id: string
   name: string
   overallScore: number
+  // Raw ranking metrics (0-100)
+  growthMomentumScore: number
+  fanEngagementScore: number
+  digitalPopularityScore: number
+  livePotentialScore: number
+  venueFitScore: number
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
-  { 
-    value: 'rising_stars', 
-    label: 'Rising Stars', 
+  {
+    value: 'rising_stars',
+    label: 'Rising Stars',
     description: 'Artists showing explosive growth',
     icon: '🚀'
   }
 ]
 
+interface RankingWeights {
+  growthMomentum: number
+  fanEngagement: number
+  digitalPopularity: number
+  livePotential: number
+  venueFit: number
+}
+
+// Weighting matrices for each ranking focus. Values should total 1.0.
+const rankingWeights: Record<string, RankingWeights> = {
+  hidden_gems: {
+    growthMomentum: 0.3,
+    fanEngagement: 0.2,
+    digitalPopularity: 0.2,
+    livePotential: 0.1,
+    venueFit: 0.2
+  },
+  genre_fit: {
+    growthMomentum: 0.1,
+    fanEngagement: 0.15,
+    digitalPopularity: 0.1,
+    livePotential: 0.15,
+    venueFit: 0.5
+  },
+  proven_draw: {
+    growthMomentum: 0.1,
+    fanEngagement: 0.15,
+    digitalPopularity: 0.3,
+    livePotential: 0.35,
+    venueFit: 0.1
+  },
+  local_buzz: {
+    growthMomentum: 0.15,
+    fanEngagement: 0.25,
+    digitalPopularity: 0.1,
+    livePotential: 0.15,
+    venueFit: 0.35
+  },
+  rising_stars: {
+    growthMomentum: 0.35,
+    fanEngagement: 0.2,
+    digitalPopularity: 0.25,
+    livePotential: 0.1,
+    venueFit: 0.1
+  }
+}
+
+const applyWeightsToBands = (bands: Band[], focus: string): Band[] => {
+  const weights = rankingWeights[focus]
+  if (!weights) return bands
+
+  return bands.map((band) => ({
+    ...band,
+    overallScore: Math.round(
+      band.growthMomentumScore * weights.growthMomentum +
+      band.fanEngagementScore * weights.fanEngagement +
+      band.digitalPopularityScore * weights.digitalPopularity +
+      band.livePotentialScore * weights.livePotential +
+      band.venueFitScore * weights.venueFit
+    )
+  }))
+}
+
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
+      growthMomentumScore: record['Growth Momentum Score'] || record.growthMomentumScore || 0,
+      fanEngagementScore: record['Fan Engagement Score'] || record.fanEngagementScore || 0,
+      digitalPopularityScore: record['Digital Popularity Score'] || record['Digital Popularity'] || record.digitalPopularityScore || 0,
+      livePotentialScore: record['Live Potential Score'] || record.livePotentialScore || 0,
+      venueFitScore: record['Venue Fit Score'] || record.venueFitScore || 0,
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
diff --git a/components/BandDashboard.tsx b/components/BandDashboard.tsx
index 6029e8801cec342ba3c37b763a374fe0db106408..b19d1c98f0d2a2a5d03ee77dd4d100d77e444276 100644
--- a/components/BandDashboard.tsx
+++ b/components/BandDashboard.tsx
@@ -172,60 +246,62 @@ const fetchBandData = async () => {
     }
     
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
-    
-    setBands(transformedBands)
-    
+
+    // Apply current ranking focus weights
+    const weightedBands = applyWeightsToBands(transformedBands, rankingFocus)
+    setBands(weightedBands)
+
     // Set last refresh time to the most recent analysis date
-    if (transformedBands.length > 0) {
-      const mostRecent = transformedBands.reduce((latest, band) => {
+    if (weightedBands.length > 0) {
+      const mostRecent = weightedBands.reduce((latest, band) => {
         const bandDate = new Date(band.dateAnalyzed)
         const latestDate = new Date(latest)
         return bandDate > latestDate ? band.dateAnalyzed : latest
-      }, transformedBands[0].dateAnalyzed)
+      }, weightedBands[0].dateAnalyzed)
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
diff --git a/components/BandDashboard.tsx b/components/BandDashboard.tsx
index 6029e8801cec342ba3c37b763a374fe0db106408..b19d1c98f0d2a2a5d03ee77dd4d100d77e444276 100644
--- a/components/BandDashboard.tsx
+++ b/components/BandDashboard.tsx
@@ -243,50 +319,55 @@ const fetchBandData = async () => {
       
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
     console.log('🎯 Component mounted, calling fetchBandData')
     fetchBandData()
   }, [])
 
+  // Recalculate overall scores when ranking focus changes
+  useEffect(() => {
+    setBands(prev => applyWeightsToBands(prev, rankingFocus))
+  }, [rankingFocus])
+
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
diff --git a/components/BandDashboard.tsx b/components/BandDashboard.tsx
index 6029e8801cec342ba3c37b763a374fe0db106408..b19d1c98f0d2a2a5d03ee77dd4d100d77e444276 100644
--- a/components/BandDashboard.tsx
+++ b/components/BandDashboard.tsx
@@ -536,50 +617,74 @@ const fetchBandData = async () => {
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
 
+                {/* Ranking Scores */}
+                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4 p-3 bg-gray-50 rounded-md">
+                  <div className="text-center">
+                    <div className="text-lg font-semibold text-gray-900">{band.growthMomentumScore}</div>
+                    <div className="text-xs text-gray-500">Growth</div>
+                  </div>
+                  <div className="text-center">
+                    <div className="text-lg font-semibold text-gray-900">{band.fanEngagementScore}</div>
+                    <div className="text-xs text-gray-500">Engagement</div>
+                  </div>
+                  <div className="text-center">
+                    <div className="text-lg font-semibold text-gray-900">{band.digitalPopularityScore}</div>
+                    <div className="text-xs text-gray-500">Digital</div>
+                  </div>
+                  <div className="text-center">
+                    <div className="text-lg font-semibold text-gray-900">{band.livePotentialScore}</div>
+                    <div className="text-xs text-gray-500">Live</div>
+                  </div>
+                  <div className="text-center">
+                    <div className="text-lg font-semibold text-gray-900">{band.venueFitScore}</div>
+                    <div className="text-xs text-gray-500">Venue Fit</div>
+                  </div>
+                </div>

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
