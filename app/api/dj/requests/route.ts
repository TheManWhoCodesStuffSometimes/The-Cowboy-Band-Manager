// app/api/dj/requests/route.ts
import { NextResponse } from 'next/server';

// Temporary in-memory store (replace with DB or your n8n integration)
let songRequests: any[] = [];

// CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Change to your customer app domain in production
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders() });
}

// GET: return all song requests
export async function GET() {
  return NextResponse.json(
    { success: true, data: songRequests },
    { headers: corsHeaders() }
  );
}

// POST: add a new song request
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body.title || !body.artist || !body.songId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, artist, songId' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Store the request
    const newRequest = {
      id: body.songId,
      title: body.title,
      artist: body.artist,
      requestCount: 1,
      venue: body.venue || 'unknown',
      timestamp: body.timestamp || new Date().toISOString(),
      source: body.source || 'unknown'
    };

    // Check if already requested — increment count if so
    const existingIndex = songRequests.findIndex((req) => req.id === newRequest.id);
    if (existingIndex !== -1) {
      songRequests[existingIndex].requestCount += 1;
    } else {
      songRequests.push(newRequest);
    }

    return NextResponse.json(
      { success: true, data: newRequest },
      { headers: corsHeaders() }
    );

  } catch (error) {
    console.error('Error processing POST /api/dj/requests:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
