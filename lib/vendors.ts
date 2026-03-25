import { getVendors, Vendor } from './googleSheets';

export interface VendorRecommendation extends Vendor {
  matchScore: number;
  matchReasons: string[];
}

export async function recommendVendors(
  trade: string,
  location: string,
  budgetTier: 'competitive' | 'mid' | 'premium' = 'mid'
): Promise<VendorRecommendation[]> {
  const allVendors = await getVendors(trade, location);

  // Score vendors
  const scored = allVendors.map((vendor) => {
    let score = 0;
    const reasons: string[] = [];

    // Reliability score (0-50 points)
    score += vendor.reliabilityScore * 5;
    if (vendor.reliabilityScore >= 8) {
      reasons.push('High reliability score');
    }

    // Success rate (0-30 points)
    const successRate = vendor.totalJobs > 0 ? vendor.successfulJobs / vendor.totalJobs : 0;
    score += successRate * 30;
    if (successRate >= 0.9) {
      reasons.push('Excellent track record');
    }

    // Pricing tier match (0-20 points)
    if (vendor.pricingTier === budgetTier) {
      score += 20;
      reasons.push('Matches budget tier');
    } else if (
      (budgetTier === 'mid' && vendor.pricingTier !== 'premium') ||
      (budgetTier === 'competitive' && vendor.pricingTier === 'competitive')
    ) {
      score += 10;
      reasons.push('Within budget range');
    }

    // Location proximity bonus
    if (vendor.location.toLowerCase().includes('charlotte')) {
      score += 10;
      reasons.push('Local to Charlotte area');
    }

    // Recent activity bonus
    const lastUpdate = new Date(vendor.lastUpdated);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) {
      score += 5;
      reasons.push('Recently active');
    }

    return {
      ...vendor,
      matchScore: score,
      matchReasons: reasons,
    };
  });

  // Sort by score and return top 3
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}

export function extractVendorInfoFromMessage(message: string): {
  vendorName?: string;
  trade?: string;
  feedback?: string;
  reliabilityUpdate?: number;
} {
  const result: any = {};

  // Extract vendor name (look for capitalized names)
  const nameMatch = message.match(/\b([A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+ [A-Z]\.|[A-Z][a-z]+)\b/);
  if (nameMatch) {
    result.vendorName = nameMatch[1];
  }

  // Extract trade (common construction trades)
  const trades = [
    'plumber',
    'electrician',
    'hvac',
    'carpenter',
    'painter',
    'roofer',
    'drywall',
    'flooring',
    'landscaper',
    'mason',
    'framer',
  ];
  for (const trade of trades) {
    if (message.toLowerCase().includes(trade)) {
      result.trade = trade.charAt(0).toUpperCase() + trade.slice(1);
      break;
    }
  }

  // Sentiment analysis for reliability
  const positiveKeywords = ['great', 'excellent', 'reliable', 'on time', 'quality', 'professional'];
  const negativeKeywords = ['late', 'poor', 'unreliable', 'problem', 'issue', 'complaint'];

  let sentiment = 0;
  for (const keyword of positiveKeywords) {
    if (message.toLowerCase().includes(keyword)) sentiment++;
  }
  for (const keyword of negativeKeywords) {
    if (message.toLowerCase().includes(keyword)) sentiment--;
  }

  if (sentiment !== 0) {
    result.feedback = message;
    // Adjust reliability: positive increases, negative decreases
    result.reliabilityUpdate = sentiment > 0 ? 0.5 : -0.5;
  }

  return result;
}
