import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ScopeOfWork {
  summary: string;
  recommendations: {
    category: string;
    items: {
      task: string;
      priority: 'high' | 'medium' | 'low';
      estimatedCost: number;
      arvImpact: string;
      notes: string;
    }[];
  }[];
  totalEstimatedCost: number;
  estimatedARVIncrease: number;
}

export async function analyzePropertyPhotos(photoUrls: string[]): Promise<ScopeOfWork> {
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

You must respond with ONLY a JSON object (no markdown, no explanations) with this exact structure:
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
          text: 'Analyze these property photos and provide a detailed scope of work with cost estimates and ARV impact analysis.',
        },
        ...photoUrls.map((url) => ({
          type: 'image_url' as const,
          image_url: { url },
        })),
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 2048, // Reduced from 4096 to prevent truncation
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content || '{}';
  
  // Log for debugging
  console.log('AI response length:', content.length);
  console.log('AI response preview:', content.substring(0, 200));
  
  try {
    // With response_format: json_object, OpenAI returns clean JSON
    const parsed = JSON.parse(content);
    
    // Validate the structure
    if (!parsed.summary || !parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      console.error('Invalid AI response structure:', parsed);
      throw new Error('AI response missing required fields');
    }
    
    return parsed as ScopeOfWork;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.error('Response content (first 500 chars):', content.substring(0, 500));
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export interface CostEstimate {
  lineItems: {
    category: string;
    task: string;
    laborCost: number;
    materialCost: number;
    timeline: string;
    notes: string;
  }[];
  subtotal: number;
  contingency: number;
  total: number;
  estimatedTimeline: string;
}

export async function generateCostEstimate(scopeOfWork: ScopeOfWork): Promise<CostEstimate> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are a professional construction estimator for the Charlotte, NC area.

Convert a scope of work into detailed cost estimates with:
- Separate labor and material costs
- Timeline estimates for each task
- 10% contingency on total
- Realistic Charlotte-area pricing

Return a JSON object with this structure:
{
  "lineItems": [
    {
      "category": "Category name",
      "task": "Task description",
      "laborCost": 0,
      "materialCost": 0,
      "timeline": "e.g., 3-5 days",
      "notes": "Any notes"
    }
  ],
  "subtotal": 0,
  "contingency": 0,
  "total": 0,
  "estimatedTimeline": "e.g., 4-6 weeks"
}`,
    },
    {
      role: 'user',
      content: `Generate a detailed cost estimate for this scope of work:\n\n${JSON.stringify(scopeOfWork, null, 2)}`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 4096,
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content || '{}';
  return JSON.parse(content);
}

export async function generateCoverLetter(
  clientName: string,
  propertyAddress: string,
  projectSummary: string,
  totalCost: number
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are writing a professional cover letter for a construction bid from Southern Cities Construction.

Write in a professional but warm tone. Highlight:
- Expertise in real estate and construction
- Understanding of the client's needs
- Commitment to quality and timeline
- Comprehensive approach

Keep it concise (2-3 paragraphs).`,
    },
    {
      role: 'user',
      content: `Generate a cover letter for:
- Client: ${clientName}
- Property: ${propertyAddress}
- Project Summary: ${projectSummary}
- Total Bid: $${totalCost.toLocaleString()}`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 1000,
    temperature: 0.7,
  });

  return response.choices[0].message.content || '';
}
