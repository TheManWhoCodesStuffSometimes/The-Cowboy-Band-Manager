// app/api/dj/blacklist/route.ts - Updated to use n8n webhook
import { NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'https://thayneautomations.app.n8n.cloud/webhook/dj';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders() });
}

// GET: return all blacklisted songs from n8n
export async function GET() {
  try {
    console.log('Fetching blacklist from n8n...');
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'blacklist.get'
      })
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    const result = await response.json();
    console.log('n8n blacklist response:', result);

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
    console.error('Error fetching blacklist from n8n:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blacklist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// POST: add a song to blacklist via n8n
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Adding to blacklist via n8n:', body);

    // Basic validation
    if (!body.songId || !body.title || !body.artist) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: songId, title, artist' },
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
        action: 'blacklist.add',
        data: {
          songId: body.songId,
          title: body.title,
          artist: body.artist
        }
      })
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    const result = await response.json();
    console.log('n8n blacklist add response:', result);

    if (result.success) {
      return NextResponse.json(
        { success: true, data: result.data },
        { headers: corsHeaders() }
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to add to blacklist' },
        { status: 400, headers: corsHeaders() }
      );
    }

  } catch (error) {
    console.error('Error adding to blacklist via n8n:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add to blacklist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// DELETE: remove a song from blacklist via n8n
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    console.log('Removing from blacklist via n8n:', body);

    // Basic validation
    if (!body.songId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: songId' },
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
        action: 'blacklist.remove',
        data: {
          songId: body.songId
        }
      })
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    const result = await response.json();
    console.log('n8n blacklist remove response:', result);

    if (result.success) {
      return NextResponse.json(
        { success: true, data: result.data },
        { headers: corsHeaders() }
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to remove from blacklist' },
        { status: 400, headers: corsHeaders() }
      );
    }

  } catch (error) {
    console.error('Error removing from blacklist via n8n:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to remove from blacklist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
