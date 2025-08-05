// app/api/bands/route.ts
import { NextResponse } from 'next/server'

const RETRIEVE_DATA_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-Retrieve-Data'

export async function GET() {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] 🚀 API Route: GET /api/bands called`)
  
  try {
    console.log(`[${timestamp}] 📡 Calling n8n webhook:`, RETRIEVE_DATA_WEBHOOK)
    
    const webhookPayload = {
      action: 'retrieve',
      timestamp: timestamp
    }
    console.log(`[${timestamp}] 📤 Webhook payload:`, webhookPayload)
    
    const response = await fetch(RETRIEVE_DATA_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    })

    console.log(`[${timestamp}] 📨 n8n response status:`, response.status)
    console.log(`[${timestamp}] 📨 n8n response headers:`, Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[${timestamp}] ❌ n8n error response:`, errorText)
      throw new Error(`n8n HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()
    console.log(`[${timestamp}] 📦 n8n response data type:`, typeof data)
    console.log(`[${timestamp}] 📦 n8n response keys:`, Object.keys(data))
    console.log(`[${timestamp}] 📦 n8n response sample:`, JSON.stringify(data).substring(0, 500) + '...')
    
    // Log the structure to help debug
    if (Array.isArray(data)) {
      console.log(`[${timestamp}] ✅ Response is array with ${data.length} items`)
    } else if (data.records) {
      console.log(`[${timestamp}] ✅ Response has records property with ${Array.isArray(data.records) ? data.records.length : 'non-array'} items`)
    } else {
      console.log(`[${timestamp}] ⚠️ Response structure unclear`)
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[${timestamp}] 💥 API Route Error:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`[${timestamp}] 💥 Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch band data', 
        details: errorMessage,
        timestamp: timestamp
      }, 
      { status: 500 }
    )
  }
}
