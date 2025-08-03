import { NextRequest, NextResponse } from 'next/server'

const REFRESH_DATA_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-refresh-data'

export async function POST(request: NextRequest) {
  console.log('API Route: POST /api/bands/refresh called')
  
  try {
    const body = await request.json()
    console.log('Request body:', body)
    console.log('Calling n8n webhook:', REFRESH_DATA_WEBHOOK)
    
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
      { error: 'Failed to refresh band data', details: error.message }, 
      { status: 500 }
    )
  }
}
