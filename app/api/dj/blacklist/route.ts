// app/api/dj/blacklist/route.ts - SEPARATE FILE
import { NextRequest, NextResponse } from 'next/server'

const DJ_BLACKLIST_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-dj-blacklist'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    // For now, return mock data
    const mockData = {
      success: true,
      data: [
        { id: 'baby-shark-pinkfong', title: 'Baby Shark', artist: 'Pinkfong' }
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
    console.log('Blacklist POST:', body)
    
    // For now, just return success
    return NextResponse.json({ success: true, data: body })
    
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
    console.log('Blacklist DELETE:', body)
    
    // For now, just return success
    return NextResponse.json({ success: true })
    
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
