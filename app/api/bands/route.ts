// app/api/bands/route.ts
import { NextRequest, NextResponse } from 'next/server'

const RETRIEVE_DATA_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-Retrieve-Data'

export async function GET() {
  console.log('API Route: GET /api/bands called')
  
  try {
    console.log('Calling n8n webhook:', RETRIEVE_DATA_WEBHOOK)
    
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

    console.log('n8n response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n error response:', errorText)
      throw new Error(`n8n HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('n8n response data:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch band data', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
