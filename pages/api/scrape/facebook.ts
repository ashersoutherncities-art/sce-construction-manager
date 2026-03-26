import type { NextApiRequest, NextApiResponse } from 'next';
import { scrapeFacebookPage, scrapeMultiplePages } from '../../../lib/facebook-scraper';
import { logScrape, findDuplicates } from '../../../lib/contractorDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, urls } = req.body;

    // Single URL scrape
    if (url) {
      const result = await scrapeFacebookPage(url);

      // Log the scrape attempt
      await logScrape({
        url: result.url,
        status: result.success ? 'success' : (result.error?.includes('not found') ? 'not_found' : 'error'),
        extractedData: result.data ? JSON.stringify(result.data) : undefined,
        errorMessage: result.error,
      });

      // Check for duplicates if data was extracted
      let duplicates: any[] = [];
      if (result.success && result.data) {
        duplicates = await findDuplicates(result.data as any);
      }

      return res.status(200).json({
        ...result,
        duplicates,
      });
    }

    // Multiple URLs scrape
    if (urls && Array.isArray(urls)) {
      if (urls.length > 10) {
        return res.status(400).json({ error: 'Maximum 10 URLs per batch' });
      }

      const results = await scrapeMultiplePages(urls);

      // Log each scrape
      for (const result of results) {
        await logScrape({
          url: result.url,
          status: result.success ? 'success' : (result.error?.includes('not found') ? 'not_found' : 'error'),
          extractedData: result.data ? JSON.stringify(result.data) : undefined,
          errorMessage: result.error,
        });
      }

      return res.status(200).json({ results });
    }

    return res.status(400).json({ error: 'Provide url or urls array' });

  } catch (err: any) {
    console.error('Scrape API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
