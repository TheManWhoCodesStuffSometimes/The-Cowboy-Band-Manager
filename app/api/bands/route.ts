// app/api/bands/route.ts
import { NextRequest, NextResponse } from 'next/server'

const RETRIEVE_DATA_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-Retrieve-Data'

export async function GET() {
  try {
    const response = await fetch(RETRIEVE_DATA_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'retrieve',
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching band data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch band data' }, 
      { status: 500 }
    )
  }
}

// app/api/bands/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'

const REFRESH_DATA_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-refresh-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(REFRESH_DATA_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'refresh',
        timestamp: new Date().toISOString(),
        lastRefresh: body.lastRefresh
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error refreshing band data:', error)
    return NextResponse.json(
      { error: 'Failed to refresh band data' }, 
      { status: 500 }
    )
  }
}
