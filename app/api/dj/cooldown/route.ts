// app/api/dj/play-song/route.ts - Updated to use n8n webhook
import { NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'https://thayneautomations.app.n8n.cloud/webhook/dj';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders() });
}

// POST: play a song (move from requests to cooldown) via n8n
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Playing song via n8n:', body);

    // Basic validation
    if (!body.songId || !body.title || !body.artist) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: songId, title, artist' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Calculate cooldown time (2 hours from now)
    const cooldownUntil = body.cooldownUntil || new Date(Date.now() + (2 * 60 * 60 * 1000)).toISOString();

    // Send to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'play.add',
        data: {
          songId: body.songId,
          title: body.title,
          artist: body.artist,
          cooldownUntil: cooldownUntil,
          playedAt: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    const result = await response.json();
    console.log('n8n play song response:', result);

    if (result.success) {
      return NextResponse.json(
        { success: true, data: result.data },
        { headers: corsHeaders() }
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to play song' },
        { status: 400, headers: corsHeaders() }
      );
    }

  } catch (error) {
    console.
