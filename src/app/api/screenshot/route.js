import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Add protocol if missing
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    // Validate URL format
    try {
      new URL(processedUrl);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Use truly free screenshot services that don't require API keys (avoid PagePeeker)
    const screenshotServices = [
      // Service 1: Mini S-Shot (Russian free service - most reliable)
      `https://mini.s-shot.ru/1200x800/PNG/1200/Z100/?${encodeURIComponent(processedUrl)}`,

      // Service 2: Thum.io (reliable alternative)
      `https://image.thum.io/get/width/1200/crop/800/${encodeURIComponent(processedUrl)}`,

      // Service 3: Thumbnail.ws (free API)
      `https://api.thumbnail.ws/api/simplescreenshot/free/png?url=${encodeURIComponent(processedUrl)}&width=1200`,
    ];

    // Use the most reliable free service first (Mini S-Shot)
    let apiUrl = screenshotServices[0];

    console.log('Generating screenshot for:', processedUrl);
    console.log('Using API URL:', apiUrl);

    // Test the primary service quickly
    try {
      const testResponse = await fetch(apiUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!testResponse.ok) {
        console.warn(`Primary service failed with status ${testResponse.status}, trying fallback`);
        apiUrl = screenshotServices[1]; // Try mini.s-shot.ru
      }
    } catch (error) {
      console.warn('Primary service test failed, using fallback:', error.message);
      apiUrl = screenshotServices[1]; // Try mini.s-shot.ru
    }

    console.log('Final screenshot URL:', apiUrl);

    return NextResponse.json({
      screenshot: apiUrl,
      originalUrl: processedUrl,
      timestamp: new Date().toISOString(),
      service: apiUrl.includes('s-shot.ru') ? 'mini-s-shot-ru' :
               apiUrl.includes('thum.io') ? 'thum-io' :
               apiUrl.includes('thumbnail.ws') ? 'thumbnail-ws' : 'unknown'
    });

  } catch (error) {
    console.error('Screenshot API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate screenshot' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Screenshot API endpoint',
      usage: 'Send POST request with { "url": "https://example.com" }'
    },
    { status: 200 }
  );
}
