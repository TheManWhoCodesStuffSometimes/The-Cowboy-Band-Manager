// app/api/dj/cooldown/route.ts - SEPARATE FILE
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    // Mock cooldown data
    const mockData = {
      success: true,
      data: [
        { 
          id: 'sweet-caroline-neil-diamond', 
          title: 'Sweet Caroline', 
          artist: 'Neil Diamond', 
          cooldownUntil: Date.now() + (1.5 * 60 * 60 * 1000) // 1.5 hours remaining
        }
      ]
    }
    
    return NextResponse.json(mockData, {
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
