// lib/airtable.ts
export interface AirtableBand {
  id: string
  fields: {
    'Band Name': string
    'Overall Score': number
    'Recommendation': 'BOOK SOON' | 'STRONG CONSIDER' | 'MAYBE' | 'PASS'
    'Spotify Followers': number
    'Spotify Popularity': number
    'Estimated Draw': string
    'Key Strengths': string
    'Concerns': string
    'Booking Status': 'New' | 'Contacted' | 'Negotiating' | 'Booked' | 'Declined'
    'Spotify URL': string
    'Last Updated': string
    'Recent Activity': string
    'Industry Buzz': string
  }
}

export interface Band {
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

class AirtableService {
  private baseId: string
  private tableId: string
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''
    this.tableId = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID || ''
    this.apiKey = process.env.AIRTABLE_API_KEY || ''
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}/${this.tableId}`
  }

  async getBands(): Promise<Band[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`)
      }

      const data = await response.json()
      return data.records.map(this.transformAirtableBand)
    } catch (error) {
      console.error('Error fetching bands from Airtable:', error)
      throw error
    }
  }

  async updateBandStatus(bandId: string, status: Band['bookingStatus']): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${bandId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Booking Status': status
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error updating band status:', error)
      throw error
    }
  }

  private transformAirtableBand(airtableBand: AirtableBand): Band {
    const fields = airtableBand.fields
    return {
      id: airtableBand.id,
      name: fields['Band Name'] || '',
      overallScore: fields['Overall Score'] || 0,
      recommendation: fields['Recommendation'] || 'MAYBE',
      spotifyFollowers: fields['Spotify Followers'] || 0,
      spotifyPopularity: fields['Spotify Popularity'] || 0,
      estimatedDraw: fields['Estimated Draw'] || '',
      keyStrengths: fields['Key Strengths'] || '',
      concerns: fields['Concerns'] || '',
      bookingStatus: fields['Booking Status'] || 'New',
      spotifyUrl: fields['Spotify URL'] || '',
      lastUpdated: fields['Last Updated'] || '',
      recentActivity: fields['Recent Activity'] || '',
      industryBuzz: fields['Industry Buzz'] || ''
    }
  }
}

export default new AirtableService()
