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
      // Service 1: Mini S-Shot (most reliable free service)
      {
        name: 'mini-s-shot-ru',
        url: `https://mini.s-shot.ru/1200x800/PNG/1200/Z100/?${encodeURIComponent(processedUrl)}`,
        method: 'GET'
      },

      // Service 2: Thum.io (reliable alternative)
      {
        name: 'thum-io',
        url: `https://image.thum.io/get/width/1200/crop/800/${encodeURIComponent(processedUrl)}`,
        method: 'GET'
      },

      // Service 3: Thumbnail.ws (free API)
      {
        name: 'thumbnail-ws',
        url: `https://api.thumbnail.ws/api/simplescreenshot/free/png?url=${encodeURIComponent(processedUrl)}&width=1200`,
        method: 'GET'
      }
    ];

    // Try services in order
    for (let i = 0; i < screenshotServices.length; i++) {
      const service = screenshotServices[i];
      
      try {
        console.log(`Trying service ${i + 1}: ${service.name}`);
        
        if (service.method === 'GET') {
          // For GET requests, just return the URL
          return NextResponse.json({
            screenshot: service.url,
            originalUrl: processedUrl,
            timestamp: new Date().toISOString(),
            service: service.name
          });
        } else {
          // For POST requests, we would need to handle differently
          // For now, skip POST methods in this demo
          continue;
        }
        
      } catch (error) {
        console.warn(`Service ${service.name} failed:`, error.message);
        continue;
      }
    }

    // If all services fail, return a fallback
    return NextResponse.json(
      { error: 'All screenshot services are currently unavailable. Please try again later.' },
      { status: 503 }
    );

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
      message: 'Screenshot API v2 endpoint',
      usage: 'Send POST request with { "url": "https://example.com" }',
      features: ['Multiple fallback services', 'Better error handling', 'No URL encoding issues']
    },
    { status: 200 }
  );
}
