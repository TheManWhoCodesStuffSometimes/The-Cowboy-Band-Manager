// app/api/dj/requests/route.ts - CLEAN VERSION
import { NextRequest, NextResponse } from 'next/server'

const DJ_REQUESTS_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-dj-requests'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] 🎵 API Route: GET /api/dj/requests called`)
  
  try {
    // For now, return mock data since n8n webhooks aren't set up yet
    const mockData = {
      success: true,
      data: [
        { id: 'queen-bohemian-rhapsody', title: 'Bohemian Rhapsody', artist: 'Queen', requestCount: 3 },
        { id: 'eagles-hotel-california', title: 'Hotel California', artist: 'Eagles', requestCount: 2 },
        { id: 'journey-dont-stop-believin', title: "Don't Stop Believin'", artist: 'Journey', requestCount: 1 }
      ]
    }
    
    return NextResponse.json(mockData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'X-Request-ID': requestId,
      }
    })
    
  } catch (error) {
    console.error(`[${timestamp}] [${requestId}] 💥 API Route Error:`, error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch song requests', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: timestamp,
        requestId: requestId
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] 🎵 API Route: POST /api/dj/requests called`)
  
  try {
    const body = await request.json()
    console.log(`[${timestamp}] [${requestId}] Request body:`, body)
    
    // For now, just return success
    return NextResponse.json({ success: true, data: body })
    
  } catch (error) {
    console.error(`[${timestamp}] [${requestId}] 💥 API Route Error:`, error)
    return NextResponse.json(
      { 
        error: 'Failed to add song request', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
