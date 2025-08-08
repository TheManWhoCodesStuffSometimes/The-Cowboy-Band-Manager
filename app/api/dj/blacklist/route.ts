import { NextResponse } from 'next/server';

let blacklist: any[] = [];

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

export async function GET() {
  return NextResponse.json({ success: true, data: blacklist }, { headers: corsHeaders() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.songId || !body.title) {
      return NextResponse.json({ success: false, error: 'Missing songId or title' }, { status: 400, headers: corsHeaders() });
    }
    blacklist.push(body);
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500, headers: corsHeaders() });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    blacklist = blacklist.filter((song) => song.songId !== body.songId);
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500, headers: corsHeaders() });
  }
}
