/**
 * Facebook Scraper for Contractor Data
 * 
 * Extracts contractor information from Facebook pages, groups, and profiles.
 * Uses Puppeteer for dynamic content rendering.
 * 
 * Rate limiting: 1 request per 5 seconds minimum
 * Respects Facebook ToS with reasonable delays
 */

import type { Contractor } from './contractorDb';

export interface ScrapeResult {
  success: boolean;
  data?: Partial<Contractor>;
  rawText?: string;
  error?: string;
  url: string;
  scrapedAt: string;
}

// Rate limiter
let lastScrapeTime = 0;
const MIN_DELAY_MS = 5000;

async function enforceRateLimit() {
  const now = Date.now();
  const elapsed = now - lastScrapeTime;
  if (elapsed < MIN_DELAY_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_DELAY_MS - elapsed));
  }
  lastScrapeTime = Date.now();
}

/** Normalize a Facebook URL */
export function normalizeFacebookUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith('http')) {
    normalized = 'https://www.facebook.com/' + normalized.replace(/^\//, '');
  }
  // Convert mobile URLs
  normalized = normalized.replace('m.facebook.com', 'www.facebook.com');
  // Remove trailing slashes and query params for consistency
  normalized = normalized.split('?')[0].replace(/\/+$/, '');
  return normalized;
}

/** Detect the type of Facebook page */
export function detectPageType(url: string): 'page' | 'group' | 'profile' | 'unknown' {
  if (url.includes('/groups/')) return 'group';
  if (url.includes('/profile.php')) return 'profile';
  if (url.includes('/pages/') || url.includes('/p/')) return 'page';
  // Most direct URLs like facebook.com/businessname are pages
  return 'page';
}

/** Extract contractor data from scraped page text */
export function extractContractorData(rawText: string, url: string): Partial<Contractor> {
  const data: Partial<Contractor> = {
    facebookUrl: url,
    state: 'NC',
  };

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract name/business name (usually the first prominent text)
  // Look for the page title pattern
  const namePatterns = [
    /^(.+?)\s*[-–|]\s*(?:Facebook|Home|About)/i,
    /^(.+?)\s*\|\s*(?:Facebook|Home|About)/i,
  ];
  for (const pattern of namePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      data.name = match[1].trim();
      data.businessName = match[1].trim();
      break;
    }
  }

  // If no name from title, try the first non-empty line
  if (!data.name && lines.length > 0) {
    data.name = lines[0].substring(0, 100);
    data.businessName = data.name;
  }

  // Extract phone numbers
  const phonePatterns = [
    /(?:phone|call|tel|mobile|cell)[:\s]*([+\d\s\-().]{7,20})/gi,
    /\b(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})\b/g,
    /\b(\+1[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{4})\b/g,
  ];
  for (const pattern of phonePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      // Clean up the phone number
      let phone = match[0].replace(/(?:phone|call|tel|mobile|cell)[:\s]*/i, '').trim();
      if (phone.replace(/\D/g, '').length >= 10) {
        data.phone = phone;
        break;
      }
    }
  }

  // Extract email
  const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailMatch) {
    data.email = emailMatch[0].toLowerCase();
  }

  // Extract website
  const websitePatterns = [
    /(?:website|site|web|visit)[:\s]*(https?:\/\/[^\s,]+)/gi,
    /(?:www\.[^\s,]+\.[a-z]{2,})/gi,
    /(https?:\/\/(?!(?:www\.)?facebook\.com)[^\s,]+)/gi,
  ];
  for (const pattern of websitePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      let website = match[0].replace(/(?:website|site|web|visit)[:\s]*/i, '').trim();
      if (!website.includes('facebook.com') && !website.includes('fb.com')) {
        data.website = website;
        break;
      }
    }
  }

  // Extract location (NC cities)
  const ncCities = [
    'Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville',
    'Cary', 'Wilmington', 'High Point', 'Concord', 'Greenville', 'Asheville',
    'Gastonia', 'Jacksonville', 'Chapel Hill', 'Huntersville', 'Apex', 'Burlington',
    'Mooresville', 'Kannapolis', 'Rocky Mount', 'Hickory', 'Monroe', 'Salisbury',
    'Indian Trail', 'Cornelius', 'Matthews', 'Mint Hill', 'Wake Forest', 'Holly Springs',
    'Sanford', 'Garner', 'Thomasville', 'Statesville', 'Asheboro', 'New Bern',
    'Leland', 'Clemmons', 'Kernersville', 'Morrisville', 'Fuquay-Varina', 'Pineville',
    'Harrisburg', 'Waxhaw', 'Stallings', 'Midland', 'Fort Mill', 'Tega Cay',
  ];
  
  for (const city of ncCities) {
    const cityRegex = new RegExp(`\\b${city}\\b`, 'i');
    if (cityRegex.test(rawText)) {
      data.city = city;
      break;
    }
  }

  // Also check for NC/North Carolina mentions
  if (/\bNorth\s+Carolina\b/i.test(rawText) || /\bNC\b/.test(rawText)) {
    data.state = 'NC';
  }

  // Extract services
  const serviceKeywords = [
    'general contractor', 'construction', 'remodeling', 'renovation', 'roofing',
    'plumbing', 'electrical', 'hvac', 'painting', 'flooring', 'framing',
    'drywall', 'landscaping', 'concrete', 'masonry', 'demolition', 'siding',
    'windows', 'doors', 'kitchen', 'bathroom', 'deck', 'fence', 'paving',
    'excavation', 'grading', 'foundation', 'waterproofing', 'insulation',
    'carpentry', 'tile', 'hardwood', 'pressure washing', 'handyman',
    'home improvement', 'new construction', 'commercial construction',
    'residential construction', 'building', 'repairs', 'maintenance',
  ];

  const foundServices: string[] = [];
  const lowerText = rawText.toLowerCase();
  for (const service of serviceKeywords) {
    if (lowerText.includes(service)) {
      foundServices.push(service.charAt(0).toUpperCase() + service.slice(1));
    }
  }
  if (foundServices.length > 0) {
    data.services = foundServices.join(', ');
  }

  // Extract follower/like count
  const followerPatterns = [
    /(\d[\d,]*)\s*(?:followers|people follow)/i,
    /(\d[\d,]*)\s*(?:likes|people like)/i,
  ];
  for (const pattern of followerPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      data.followers = parseInt(match[1].replace(/,/g, ''), 10);
      break;
    }
  }

  // Extract licensing info
  const licensePatterns = [
    /(?:license|licensed|lic)[:\s#]*([A-Z0-9-]+)/gi,
    /(?:GC|general contractor)\s*(?:license|lic)[:\s#]*([A-Z0-9-]+)/gi,
    /NC\s*(?:license|lic)[:\s#]*([A-Z0-9-]+)/gi,
  ];
  const licenseInfo: string[] = [];
  for (const pattern of licensePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      licenseInfo.push(match[0]);
    }
  }
  if (licenseInfo.length > 0) {
    data.notes = `License info: ${licenseInfo.join('; ')}`;
  }

  return data;
}

/**
 * Scrape a Facebook page using Puppeteer.
 * This function is meant to be called from the API route.
 */
export async function scrapeFacebookPage(url: string): Promise<ScrapeResult> {
  await enforceRateLimit();

  const normalizedUrl = normalizeFacebookUrl(url);
  const scrapedAt = new Date().toISOString();

  try {
    // Dynamic import - Puppeteer may not be available in all environments
    const puppeteer = await import('puppeteer');
    
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
    });

    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate with timeout
    try {
      await page.goto(normalizedUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
    } catch (navErr: any) {
      if (navErr.message?.includes('timeout')) {
        await browser.close();
        return { success: false, error: 'Page load timeout (30s)', url: normalizedUrl, scrapedAt };
      }
      throw navErr;
    }

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check for login wall / blocked page
    const pageContent = await page.content();
    if (pageContent.includes('You must log in to continue') || 
        pageContent.includes('Log Into Facebook') ||
        pageContent.includes('Create new account')) {
      // Try scrolling to load more content even on login wall
      // Facebook sometimes shows partial content
    }

    // Check for "page not found"
    const title = await page.title();
    if (title.includes('Page Not Found') || title.includes('Content Not Found')) {
      await browser.close();
      return { success: false, error: 'Page not found', url: normalizedUrl, scrapedAt };
    }

    // Extract all visible text from the page
    const rawText = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, noscript');
      scripts.forEach(s => s.remove());
      
      // Get text from body
      const body = document.body;
      if (!body) return '';
      
      // Get all text content
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
      const texts: string[] = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent?.trim();
        if (text && text.length > 1) {
          texts.push(text);
        }
      }
      return texts.join('\n');
    });

    // Also try to get specific About/Contact sections
    const aboutText = await page.evaluate(() => {
      const selectors = [
        '[data-pagelet="ProfileTileCollection"]',
        '[data-pagelet="PageProfileAboutSection"]',
        '.x1yztbdb', // About section containers
        '[role="main"]',
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el.textContent || '';
      }
      return '';
    });

    const combinedText = `${title}\n${rawText}\n${aboutText}`;
    
    await browser.close();

    // Extract structured data
    const data = extractContractorData(combinedText, normalizedUrl);

    if (!data.name || data.name.length < 2) {
      return {
        success: false,
        error: 'Could not extract contractor name from page',
        rawText: combinedText.substring(0, 2000),
        url: normalizedUrl,
        scrapedAt,
      };
    }

    return {
      success: true,
      data,
      rawText: combinedText.substring(0, 5000),
      url: normalizedUrl,
      scrapedAt,
    };

  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unknown scraping error',
      url: normalizedUrl,
      scrapedAt,
    };
  }
}

/**
 * Scrape multiple Facebook URLs with rate limiting
 */
export async function scrapeMultiplePages(urls: string[]): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  for (const url of urls) {
    const result = await scrapeFacebookPage(url);
    results.push(result);
  }
  return results;
}
