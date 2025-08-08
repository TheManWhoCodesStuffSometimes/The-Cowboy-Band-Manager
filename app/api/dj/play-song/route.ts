import { NextResponse } from 'next/server';

let cooldownSongs: any[] = [];

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.songId || !body.title) {
      return NextResponse.json({ success: false, error: 'Missing songId or title' }, { status: 400, headers: corsHeaders() });
    }

    cooldownSongs.push({
      songId: body.songId,
      title: body.title,
      artist: body.artist,
      cooldownUntil: body.cooldownUntil || new Date(Date.now() + 10 * 60000).toISOString(), // default 10 min cooldown
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500, headers: corsHeaders() });
  }
}
