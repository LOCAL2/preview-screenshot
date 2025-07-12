// Test script to validate screenshot URLs return actual images, not error messages
// Run with: node test-screenshot-validity.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testUrls = [
  'https://www.google.com',
  'https://www.github.com',
  'example.com',
];

async function testScreenshotValidity(url, apiEndpoint = '/api/screenshot-simple') {
  try {
    console.log(`\n🧪 Testing: ${url} with ${apiEndpoint}`);
    
    // Step 1: Get screenshot URL from our API
    const apiResponse = await fetch(`http://localhost:3000${apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!apiResponse.ok) {
      console.log(`❌ API Error: ${apiResponse.status}`);
      return false;
    }

    const data = await apiResponse.json();
    console.log(`📸 Screenshot URL: ${data.screenshot}`);
    console.log(`🔧 Service: ${data.service}`);

    // Step 2: Test if the screenshot URL returns a valid image
    const imageResponse = await fetch(data.screenshot, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(`📊 Image Response Status: ${imageResponse.status}`);
    console.log(`📋 Content-Type: ${imageResponse.headers.get('content-type')}`);
    console.log(`📏 Content-Length: ${imageResponse.headers.get('content-length')} bytes`);

    // Check if it's actually an image
    const contentType = imageResponse.headers.get('content-type');
    const contentLength = parseInt(imageResponse.headers.get('content-length') || '0');

    if (imageResponse.ok && contentType && contentType.startsWith('image/')) {
      if (contentLength > 1000) { // Reasonable size for a screenshot
        console.log(`✅ Valid screenshot image (${contentLength} bytes)`);
        return true;
      } else {
        console.log(`⚠️  Image too small (${contentLength} bytes) - might be error image`);
        return false;
      }
    } else {
      console.log(`❌ Not a valid image response`);
      return false;
    }

  } catch (error) {
    console.log(`💥 Test failed: ${error.message}`);
    return false;
  }
}

async function testAllAPIs() {
  console.log('🚀 Testing Screenshot Validity Across All APIs...');
  console.log('🎯 Checking if APIs return actual images vs error messages\n');

  const apis = [
    '/api/screenshot-simple',
    '/api/screenshot',
    '/api/screenshot-v2'
  ];

  const results = {};

  for (const api of apis) {
    console.log(`\n🔍 Testing API: ${api}`);
    console.log('='.repeat(50));
    
    results[api] = {};
    
    for (const url of testUrls) {
      const isValid = await testScreenshotValidity(url, api);
      results[api][url] = isValid;
      
      // Wait between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n📊 SUMMARY REPORT');
  console.log('='.repeat(60));
  
  for (const api of apis) {
    console.log(`\n🔧 ${api}:`);
    const apiResults = results[api];
    const successCount = Object.values(apiResults).filter(Boolean).length;
    const totalCount = Object.keys(apiResults).length;
    
    console.log(`   Success Rate: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
    
    for (const [url, isValid] of Object.entries(apiResults)) {
      const status = isValid ? '✅' : '❌';
      console.log(`   ${status} ${url}`);
    }
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  const bestAPI = apis.find(api => {
    const successRate = Object.values(results[api]).filter(Boolean).length / testUrls.length;
    return successRate === 1;
  });

  if (bestAPI) {
    console.log(`🏆 Best API: ${bestAPI} (100% success rate)`);
  } else {
    const apiScores = apis.map(api => ({
      api,
      score: Object.values(results[api]).filter(Boolean).length / testUrls.length
    })).sort((a, b) => b.score - a.score);
    
    console.log(`🥇 Recommended API: ${apiScores[0].api} (${Math.round(apiScores[0].score * 100)}% success rate)`);
  }

  console.log('\n✨ Testing completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAllAPIs();
}

module.exports = { testScreenshotValidity };
