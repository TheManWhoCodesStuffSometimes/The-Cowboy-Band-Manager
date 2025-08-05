// app/api/bands/route.ts
import { NextResponse } from 'next/server'

const RETRIEVE_DATA_WEBHOOK = 'https://thayneautomations.app.n8n.cloud/webhook/The-Cowboy-Saloon-Retrieve-Data'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] 🚀 API Route: GET /api/bands called`)
  console.log(`[${timestamp}] [${requestId}] 🌍 Environment: ${process.env.NODE_ENV}`)
  console.log(`[${timestamp}] [${requestId}] 🔄 Force dynamic enabled, should not cache`)
  
  try {
    console.log(`[${timestamp}] [${requestId}] 📡 Calling n8n webhook:`, RETRIEVE_DATA_WEBHOOK)
    
    const webhookPayload = {
      action: 'retrieve',
      timestamp: timestamp,
      requestId: requestId,
      cacheBuster: Math.random().toString(36) // Force unique request
    }
    console.log(`[${timestamp}] [${requestId}] 📤 Webhook payload:`, webhookPayload)
    
    const response = await fetch(RETRIEVE_DATA_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify(webhookPayload)
    })

    console.log(`[${timestamp}] [${requestId}] 📨 n8n response status:`, response.status)
    console.log(`[${timestamp}] [${requestId}] 📨 n8n response headers:`, Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[${timestamp}] [${requestId}] ❌ n8n error response:`, errorText)
      throw new Error(`n8n HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()
    console.log(`[${timestamp}] [${requestId}] 📦 n8n response data type:`, typeof data)
    console.log(`[${timestamp}] [${requestId}] 📦 n8n response keys:`, Object.keys(data))
    console.log(`[${timestamp}] [${requestId}] 📦 n8n response sample:`, JSON.stringify(data).substring(0, 500) + '...')
    
    // Log the structure to help debug
    if (Array.isArray(data)) {
      console.log(`[${timestamp}] [${requestId}] ✅ Response is array with ${data.length} items`)
    } else if (data.records) {
      console.log(`[${timestamp}] [${requestId}] ✅ Response has records property with ${Array.isArray(data.records) ? data.records.length : 'non-array'} items`)
    } else {
      console.log(`[${timestamp}] [${requestId}] ⚠️ Response structure unclear`)
    }
    
    // Return with explicit no-cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Request-ID': requestId,
        'X-Timestamp': timestamp
      }
    })
    
  } catch (error) {
    console.error(`[${timestamp}] [${requestId}] 💥 API Route Error:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`[${timestamp}] [${requestId}] 💥 Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch band data', 
        details: errorMessage,
        timestamp: timestamp,
        requestId: requestId
      }, 
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  }
}
