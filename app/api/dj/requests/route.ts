// app/api/dj/requests/route.ts
import { NextRequest, NextResponse } from 'next/server'

const DJ_REQUESTS_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-dj-requests'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] 🎵 API Route: GET /api/dj/requests called`)
  
  try {
    console.log(`[${timestamp}] [${requestId}] 📡 Calling n8n webhook:`, DJ_REQUESTS_WEBHOOK)
    
    const response = await fetch(DJ_REQUESTS_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: JSON.stringify({
        action: 'get_requests',
        timestamp: timestamp,
        requestId: requestId,
      })
    })

    console.log(`[${timestamp}] [${requestId}] 📨 n8n response status:`, response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[${timestamp}] [${requestId}] ❌ n8n error response:`, errorText)
      throw new Error(`n8n HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[${timestamp}] [${requestId}] 📦 n8n response:`, data)
    
    return NextResponse.json(data, {
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
    
    const response = await fetch(DJ_REQUESTS_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'add_request',
        timestamp: timestamp,
        requestId: requestId,
        ...body
      })
    })

    if (!response.ok) {
      throw new Error(`n8n HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
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

// app/api/dj/blacklist/route.ts
import { NextRequest, NextResponse } from 'next/server'

const DJ_BLACKLIST_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-dj-blacklist'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    const response = await fetch(DJ_BLACKLIST_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: JSON.stringify({
        action: 'get_blacklist',
        timestamp: timestamp,
        requestId: requestId,
      })
    })

    if (!response.ok) {
      throw new Error(`n8n HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'X-Request-ID': requestId,
      }
    })
    
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch blacklist', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(DJ_BLACKLIST_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'add_blacklist',
        timestamp: new Date().toISOString(),
        ...body
      })
    })

    if (!response.ok) {
      throw new Error(`n8n HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add to blacklist', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(DJ_BLACKLIST_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'remove_blacklist',
        timestamp: new Date().toISOString(),
        ...body
      })
    })

    if (!response.ok) {
      throw new Error(`n8n HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to remove from blacklist', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// app/api/dj/cooldown/route.ts
import { NextRequest, NextResponse } from 'next/server'

const DJ_COOLDOWN_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-dj-cooldown'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    const response = await fetch(DJ_COOLDOWN_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: JSON.stringify({
        action: 'get_cooldown',
        timestamp: timestamp,
        requestId: requestId,
      })
    })

    if (!response.ok) {
      throw new Error(`n8n HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'X-Request-ID': requestId,
      }
    })
    
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch cooldown songs', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// app/api/dj/play-song/route.ts
import { NextRequest, NextResponse } from 'next/server'

const DJ_PLAY_SONG_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-dj-play-song'

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] 🎵 API Route: POST /api/dj/play-song called`)
  
  try {
    const body = await request.json()
    console.log(`[${timestamp}] [${requestId}] Request body:`, body)
    
    const response = await fetch(DJ_PLAY_SONG_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'play_song',
        timestamp: timestamp,
        requestId: requestId,
        ...body
      })
    })

    if (!response.ok) {
      throw new Error(`n8n HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error(`[${timestamp}] [${requestId}] 💥 API Route Error:`, error)
    return NextResponse.json(
      { 
        error: 'Failed to play song', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
