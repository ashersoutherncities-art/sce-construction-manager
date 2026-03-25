// Quick test script for photo analysis API
// Run with: node test-photo-analysis.js

const photoUrls = [
  'https://example.com/photo1.jpg',
  'https://example.com/photo2.jpg',
  'https://example.com/photo3.jpg',
];

async function testAnalysis() {
  try {
    const response = await fetch('http://localhost:3000/api/ai/analyze-photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoUrls }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error response:', data);
      return;
    }

    console.log('✅ Success!');
    console.log('Summary:', data.scopeOfWork.summary);
    console.log('Total Cost:', data.scopeOfWork.totalEstimatedCost);
    console.log('ARV Increase:', data.scopeOfWork.estimatedARVIncrease);
    console.log('Recommendations:', data.scopeOfWork.recommendations.length, 'categories');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAnalysis();
