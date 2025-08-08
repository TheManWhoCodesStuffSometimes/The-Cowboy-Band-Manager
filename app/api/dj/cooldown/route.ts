import { NextResponse } from 'next/server';

let cooldownSongs: any[] = [];

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

export async function GET() {
  return NextResponse.json({ success: true, data: cooldownSongs }, { headers: corsHeaders() });
}
