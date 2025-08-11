// app/api/dj/requests/route.ts - Updated to use n8n webhook
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

// GET: return all song requests from n8n
export async function GET() {
  try {
    console.log('Fetching requests from n8n...');
    
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

    // Handle n8n response format
    if (result.success) {
      return NextResponse.json(
        { success: true, data: result.data || [] },
        { headers: corsHeaders() }
      );
    } else {
      throw new Error(result.error || 'n8n returned unsuccessful response');
    }

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

// POST: add a new song request via n8n
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Adding request via n8n:', body);

    // Basic validation
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
    console.error('Error adding request via n8n:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
