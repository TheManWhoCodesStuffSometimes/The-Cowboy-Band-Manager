// app/api/dj/play-song/route.ts - SEPARATE FILE
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] 🎵 API Route: POST /api/dj/play-song called`)
  
  try {
    const body = await request.json()
    console.log(`[${timestamp}] [${requestId}] Request body:`, body)
    
    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Song moved to cooldown',
      data: body 
    })
    
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
