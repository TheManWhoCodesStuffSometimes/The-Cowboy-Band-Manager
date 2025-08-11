// app/api/dj/cooldown/route.ts - Updated to use n8n webhook
import { NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'https://thayneautomations.app.n8n.cloud/webhook/dj';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders() });
}

// GET: return all songs on cooldown from n8n
export async function GET() {
  try {
    console.log('Fetching cooldown songs from n8n...');
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'cooldown.get'
      })
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    const result = await response.json();
    console.log('n8n cooldown response:', result);

    // Handle n8n response format
    if (result.success) {
      // Convert cooldown data to match frontend expectations
      const cooldownSongs = (result.data || []).map((song: any) => ({
        id: song.songId || song.id,
        title: song.title,
        artist: song.artist,
        cooldownUntil: song.cooldownUntil ? new Date(song.cooldownUntil).getTime() : Date.now() + (2 * 60 * 60 * 1000),
        playedAt: song.playedAt || song.timestamp
      }));

      return NextResponse.json(
        { success: true, data: cooldownSongs },
        { headers: corsHeaders() }
      );
    } else {
      throw new Error(result.error || 'n8n returned unsuccessful response');
    }

  } catch (error) {
    console.error('Error fetching cooldown songs from n8n:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cooldown songs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
