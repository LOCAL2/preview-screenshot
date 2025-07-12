// Performance test script for the screenshot API
// Run with: node performance-test.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testUrls = [
  'https://www.google.com',
  'https://www.github.com',
  'https://www.stackoverflow.com',
  'https://www.wikipedia.org',
  'https://www.reddit.com',
];

async function measurePerformance(url) {
  const startTime = Date.now();
  
  try {
    console.log(`\n🚀 Testing: ${url}`);
    console.log('⏱️  Starting timer...');
    
    const response = await fetch('http://localhost:3000/api/screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const apiTime = Date.now() - startTime;
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ API Response: ${apiTime}ms`);
      console.log(`📸 Screenshot URL: ${data.screenshot}`);
      
      // Test image loading time
      const imageStartTime = Date.now();
      try {
        const imageResponse = await fetch(data.screenshot, { method: 'HEAD' });
        const imageTime = Date.now() - imageStartTime;
        
        if (imageResponse.ok) {
          console.log(`🖼️  Image Load: ${imageTime}ms`);
          console.log(`⚡ Total Time: ${apiTime + imageTime}ms`);
        } else {
          console.log(`❌ Image failed to load: ${imageResponse.status}`);
        }
      } catch (imageError) {
        console.log(`❌ Image load error: ${imageError.message}`);
      }
      
    } else {
      console.log(`❌ API Error: ${data.error}`);
    }
    
    return apiTime;
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.log(`💥 Request failed after ${errorTime}ms: ${error.message}`);
    return errorTime;
  }
}

async function runPerformanceTests() {
  console.log('🏃‍♂️ Starting Performance Tests...');
  console.log('📊 Testing API response times and image loading');
  console.log('Make sure the Next.js server is running on http://localhost:3000\n');
  
  const times = [];
  
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    const time = await measurePerformance(url);
    times.push(time);
    
    // Wait between tests to avoid rate limiting
    if (i < testUrls.length - 1) {
      console.log('⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Calculate statistics
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  console.log('\n📈 Performance Summary:');
  console.log(`📊 Average API Response Time: ${avgTime.toFixed(1)}ms`);
  console.log(`⚡ Fastest Response: ${minTime}ms`);
  console.log(`🐌 Slowest Response: ${maxTime}ms`);
  console.log(`📋 Total Tests: ${times.length}`);
  
  // Performance recommendations
  console.log('\n💡 Performance Tips:');
  if (avgTime > 2000) {
    console.log('⚠️  API responses are slow (>2s). Consider using faster screenshot services.');
  } else if (avgTime > 1000) {
    console.log('⚠️  API responses are moderate (>1s). Performance is acceptable.');
  } else {
    console.log('✅ API responses are fast (<1s). Great performance!');
  }
  
  console.log('\n✨ Performance test completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPerformanceTests();
}

module.exports = { measurePerformance };
