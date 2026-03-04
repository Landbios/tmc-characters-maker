import { NextRequest, NextResponse } from 'next/server';

// Server-side image proxy — bypasses CORS restrictions on external image hosts.
// Returns the raw image binary so the client can call response.blob() directly.
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TMC-Carnet-Proxy/1.0)',
        'Accept': 'image/*,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[proxy-image] fetch error:', err);
    return new NextResponse(null, { status: 500 });
  }
}
