import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testPhotoAnalysis() {
  console.log('🧪 Testing Photo Analysis with AI...\n');

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('✅ API key found\n');

  try {
    const openai = new OpenAI({ apiKey });

    // Test with a sample kitchen image (public domain)
    const testImageUrl = 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800';
    
    console.log('📸 Testing with sample kitchen image...');
    console.log('Image URL:', testImageUrl, '\n');

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an expert construction estimator and property investor specializing in ARV (After Repair Value) maximization. 

Analyze property photos and provide a detailed scope of work focused on:
1. Necessary repairs and improvements
2. ARV maximization opportunities
3. Cost-effective upgrades with highest ROI
4. Priority ranking based on impact vs cost

Focus on properties in the Charlotte, NC area. Consider local market preferences and typical ARV factors.

Return a JSON object with this structure:
{
  "summary": "Overall property assessment",
  "recommendations": [
    {
      "category": "Category name (e.g., Kitchen, Bathrooms, Exterior)",
      "items": [
        {
          "task": "Specific task description",
          "priority": "high|medium|low",
          "estimatedCost": 0,
          "arvImpact": "Description of ARV impact",
          "notes": "Additional notes"
        }
      ]
    }
  ],
  "totalEstimatedCost": 0,
  "estimatedARVIncrease": 0
}`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this property photo and provide a detailed scope of work with cost estimates and ARV impact analysis.',
          },
          {
            type: 'image_url',
            image_url: { url: testImageUrl },
          },
        ],
      },
    ];

    console.log('🤖 Calling OpenAI API with gpt-4o...');
    const startTime = Date.now();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 4096,
      temperature: 0.7,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Response received in ${duration}s\n`);

    const content = response.choices[0].message.content || '{}';
    console.log('📄 Raw response:', content.substring(0, 500) + '...\n');

    // Parse response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                     content.match(/```\s*([\s\S]*?)\s*```/) ||
                     content.match(/(\{[\s\S]*\})/);
    
    if (!jsonMatch) {
      console.error('❌ Failed to extract JSON from response');
      console.log('Full response:', content);
      process.exit(1);
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    console.log('✅ Successfully parsed JSON response\n');
    console.log('📊 Analysis Results:');
    console.log('  Summary:', parsed.summary);
    console.log('  Categories:', parsed.recommendations?.length || 0);
    console.log('  Total Estimated Cost: $' + (parsed.totalEstimatedCost || 0).toLocaleString());
    console.log('  Estimated ARV Increase: $' + (parsed.estimatedARVIncrease || 0).toLocaleString());
    console.log('\n📋 Recommendations:');
    
    parsed.recommendations?.forEach((cat: any) => {
      console.log(`\n  ${cat.category}:`);
      cat.items?.forEach((item: any) => {
        console.log(`    - [${item.priority?.toUpperCase()}] ${item.task}`);
        console.log(`      Cost: $${item.estimatedCost?.toLocaleString()}`);
        console.log(`      ARV Impact: ${item.arvImpact}`);
      });
    });

    console.log('\n\n🎉 Photo analysis test completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error during photo analysis:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      if ('status' in error) {
        console.error('Status:', (error as any).status);
      }
      if ('code' in error) {
        console.error('Code:', (error as any).code);
      }
    }
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testPhotoAnalysis();
