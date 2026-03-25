import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plans, projectType } = req.body;

    if (!plans || plans.length === 0) {
      return res.status(400).json({ error: 'No plans provided' });
    }

    // Prepare images for Claude
    const imageBlocks = plans.map((dataUrl: string) => {
      const base64Data = dataUrl.split(',')[1];
      const mimeType = dataUrl.match(/data:(.*?);/)?.[1] || 'image/jpeg';
      
      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: base64Data,
        },
      };
    });

    const prompt = `You are an expert construction estimator. Analyze these architectural plans/blueprints for a ${projectType} project.

Provide a detailed cost estimate including:

1. **Square footage** (estimate from plans)
2. **Total cost range** (low to high)
3. **Detailed breakdown** by category:
   - Foundation/Sitework
   - Framing/Structure
   - Roofing
   - Exterior (siding, windows, doors)
   - Plumbing
   - Electrical
   - HVAC
   - Insulation
   - Drywall/Interior finish
   - Flooring
   - Cabinetry/Millwork
   - Fixtures/Appliances
   - Permits/Inspections
   - Contingency (10-15%)

4. **Key assumptions** made
5. **Important notes** or risks

Format as JSON:
{
  "squareFeet": <number>,
  "totalCost": <number>,
  "costRange": { "low": <number>, "high": <number> },
  "breakdown": [
    { "category": "Foundation/Sitework", "cost": <number>, "notes": "..." },
    ...
  ],
  "assumptions": ["assumption 1", "assumption 2"],
  "notes": "Important considerations..."
}

Base costs on North Carolina market rates (2026). Be realistic and detailed.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks,
            { type: 'text' as const, text: prompt },
          ],
        },
      ],
    });

    // Extract JSON from response
    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Try to extract JSON from the response
    let estimate;
    try {
      // Look for JSON block in markdown
      const jsonMatch = textContent.text.match(/```json\n([\s\S]*?)\n```/) || 
                        textContent.text.match(/```\n([\s\S]*?)\n```/) ||
                        textContent.text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        estimate = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        estimate = JSON.parse(textContent.text);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', textContent.text);
      
      // Fallback: return raw text as notes
      estimate = {
        squareFeet: 0,
        totalCost: 0,
        breakdown: [],
        notes: textContent.text,
      };
    }

    return res.status(200).json({ estimate });
  } catch (error) {
    console.error('Error analyzing plans:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze plans',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
