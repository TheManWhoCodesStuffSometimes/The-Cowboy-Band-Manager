// app/api/dj/requests/route.ts - UPDATED WITH CORS SUPPORT
import { NextRequest, NextResponse } from 'next/server'

const DJ_REQUESTS_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-dj-requests'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Add CORS headers for cross-origin requests from customer interface
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, specify your customer interface domain
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

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
        ...corsHeaders,
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
      { 
        status: 500,
        headers: corsHeaders
      }
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
    
    // Enhanced payload for n8n webhook
    const webhookPayload = {
      action: 'add_request',
      timestamp: timestamp,
      requestId: requestId,
      venue: body.venue || 'cowboy-saloon-main',
      song: {
        id: body.songId,
        title: body.title,
        artist: body.artist,
        source: body.source || 'unknown',
        requestedAt: body.timestamp || timestamp
      }
    }

    // Send to n8n webhook for processing and storage (optional for now)
    console.log(`[${timestamp}] [${requestId}] Would send to n8n webhook:`, DJ_REQUESTS_WEBHOOK)
    console.log(`[${timestamp}] [${requestId}] Webhook payload:`, webhookPayload)
    
    try {
      const webhookResponse = await fetch(DJ_REQUESTS_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      })

      if (webhookResponse.ok) {
        console.log(`[${timestamp}] [${requestId}] Successfully sent to n8n`)
      } else {
        console.warn(`[${timestamp}] [${requestId}] n8n webhook failed but continuing:`, webhookResponse.status)
      }
    } catch (webhookError) {
      console.warn(`[${timestamp}] [${requestId}] n8n webhook error (non-critical):`, webhookError)
    }
    
    // Always return success to the customer interface
    return NextResponse.json({ 
      success: true, 
      message: 'Song request received and processed',
      data: {
        songId: body.songId,
        title: body.title,
        artist: body.artist,
        venue: body.venue,
        requestedAt: timestamp
      },
      requestId: requestId,
      timestamp: timestamp
    }, {
      headers: corsHeaders
    })
    
  } catch (error) {
    console.error(`[${timestamp}] [${requestId}] 💥 API Route Error:`, error)
    return NextResponse.json(
      { 
        error: 'Failed to add song request', 
        details: error instanceof Error ? error.message : 'Unknown error',
        requestId: requestId,
        timestamp: timestamp
      }, 
      { 
        status: 500,
        headers: corsHeaders
      }
    )
  }
}
