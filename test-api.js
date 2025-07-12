// Test script for the screenshot API
// Run with: node test-api.js

// Import fetch for Node.js (if needed)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testUrls = [
  'https://www.google.com',
  'https://www.github.com',
  'https://www.stackoverflow.com',
  'example.com', // Test URL without protocol
];

async function testScreenshotAPI(url) {
  try {
    console.log(`\n🧪 Testing URL: ${url}`);
    
    const response = await fetch('http://localhost:3000/api/screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log('📸 Screenshot URL:', data.screenshot);
      console.log('🔗 Original URL:', data.originalUrl);
      console.log('⏰ Timestamp:', data.timestamp);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.log('💥 Request failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Screenshot API Tests...');
  console.log('Make sure the Next.js server is running on http://localhost:3000');
  
  for (const url of testUrls) {
    await testScreenshotAPI(url);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testScreenshotAPI };
