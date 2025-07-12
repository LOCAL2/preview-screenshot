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

    console.log('Fast screenshot generation for:', processedUrl);

    // Use fast and reliable services (avoid PagePeeker due to redirect issues)
    const fastServices = [
      // Service 1: Mini S-Shot with small size for speed
      {
        name: 'mini-s-shot-ru-small',
        url: `https://mini.s-shot.ru/800x600/PNG/800/Z100/?${encodeURIComponent(processedUrl)}`,
        priority: 1
      },

      // Service 2: Thum.io (fast service)
      {
        name: 'thum-io',
        url: `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(processedUrl)}`,
        priority: 2
      }
    ];

    // Use Mini S-Shot with smaller size for speed
    const selectedService = fastServices[0];
    const screenshotUrl = selectedService.url;
    
    console.log(`Using fast service: ${selectedService.name}`);
    console.log('Screenshot URL:', screenshotUrl);

    return NextResponse.json({
      screenshot: screenshotUrl,
      originalUrl: processedUrl,
      timestamp: new Date().toISOString(),
      service: selectedService.name,
      note: 'Using optimized fast service with smaller image size'
    });

  } catch (error) {
    console.error('Fast Screenshot API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate screenshot: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Fast Screenshot API endpoint',
      usage: 'Send POST request with { "url": "https://example.com" }',
      features: ['Optimized for speed', 'Smaller image sizes', 'Fast services only']
    },
    { status: 200 }
  );
}
