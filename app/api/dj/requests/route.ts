// app/api/dj/requests/route.ts - Updated to handle new unified API
import { NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'https://thayneautomations.app.n8n.cloud/webhook/dj';

// CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders() });
}

// GET: return all song requests from n8n (legacy support)
export async function GET() {
  try {
    console.log('Fetching requests from n8n (legacy GET)...');
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'requests.get'
      })
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    const result = await response.json();
    console.log('n8n response:', result);

    // Handle n8n response format - return the raw response for now
    return NextResponse.json(result, { headers: corsHeaders() });

  } catch (error) {
    console.error('Error fetching requests from n8n:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch requests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// POST: handle both new unified requests and legacy add requests
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('DJ API POST request:', body);

    // Check if this is the new unified data request
    if (body.action === 'requests.get') {
      console.log('Fetching unified DJ data from n8n...');
      
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'requests.get'
        })
      });

      if (!response.ok) {
        throw new Error(`n8n responded with status ${response.status}`);
      }

      const result = await response.json();
      console.log('n8n unified response:', result);

      // Return the raw response from n8n
      return NextResponse.json(
        { success: true, data: result },
        { headers: corsHeaders() }
      );
    }

    // Legacy: add a new song request via n8n
    console.log('Adding request via n8n (legacy):', body);

    // Basic validation for legacy requests
    if (!body.title || !body.artist || !body.songId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, artist, songId' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Send to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'requests.add',
        data: {
          songId: body.songId,
          title: body.title,
          artist: body.artist,
          venue: body.venue || 'unknown',
          timestamp: body.timestamp || new Date().toISOString(),
          requestCount: body.requestCount || 1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    const result = await response.json();
    console.log('n8n add response:', result);

    if (result.success) {
      return NextResponse.json(
        { success: true, data: result.data },
        { headers: corsHeaders() }
      );
    } else {
      // Handle specific n8n errors (like blacklist)
      return NextResponse.json(
        { success: false, error: result.error || 'Request failed' },
        { status: 400, headers: corsHeaders() }
      );
    }

  } catch (error) {
    console.error('Error in DJ requests API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
