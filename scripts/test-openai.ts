import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testOpenAI() {
  console.log('🧪 Testing OpenAI API...\n');

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('✅ API key found:', apiKey.substring(0, 20) + '...');

  try {
    const openai = new OpenAI({ apiKey });

    console.log('\n🔍 Testing basic chat completion...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond with a short message.',
        },
        {
          role: 'user',
          content: 'Say "OpenAI API is working correctly!" in JSON format with a "message" field.',
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;
    console.log('✅ Response received:', content);
    
    const parsed = JSON.parse(content || '{}');
    console.log('✅ JSON parsing successful:', parsed);

    console.log('\n🎉 All tests passed! OpenAI API is working correctly.\n');
  } catch (error) {
    console.error('\n❌ Error testing OpenAI API:');
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

testOpenAI();
