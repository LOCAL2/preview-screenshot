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

    console.log('Generating screenshot for:', processedUrl);

    // Use truly free services that don't require API keys
    const freeServices = [
      // Service 1: Mini S-Shot (Russian free service)
      `https://mini.s-shot.ru/1200x800/PNG/1200/Z100/?${encodeURIComponent(processedUrl)}`,

      // Service 2: PagePeeker (free tier)
      `https://free.pagepeeker.com/v2/thumbs.php?size=l&url=${encodeURIComponent(processedUrl)}`,

      // Service 3: Thumbnail.ws (free API)
      `https://api.thumbnail.ws/api/simplescreenshot/free/png?url=${encodeURIComponent(processedUrl)}&width=1200`
    ];

    // Try the first service (Mini S-Shot)
    const screenshotUrl = freeServices[0];

    console.log('Screenshot URL:', screenshotUrl);

    return NextResponse.json({
      screenshot: screenshotUrl,
      originalUrl: processedUrl,
      timestamp: new Date().toISOString(),
      service: 'mini-s-shot-ru',
      note: 'Using free service without API key requirements'
    });

  } catch (error) {
    console.error('Screenshot API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate screenshot: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Simple Screenshot API endpoint',
      usage: 'Send POST request with { "url": "https://example.com" }',
      method: 'Uses query parameters to avoid Apache Tomcat encoding issues'
    },
    { status: 200 }
  );
}
