import type { NextApiRequest, NextApiResponse } from 'next';
import { generateCoverLetter, CostEstimate } from '@/lib/openai';
import { generateBidPDF } from '@/lib/pdfGenerator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, clientName, propertyAddress, projectSummary, costEstimate } = req.body as {
      projectId: string;
      clientName: string;
      propertyAddress: string;
      projectSummary: string;
      costEstimate: CostEstimate;
    };

    if (!projectId || !clientName || !propertyAddress || !costEstimate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate cover letter
    const coverLetter = await generateCoverLetter(
      clientName,
      propertyAddress,
      projectSummary,
      costEstimate.total
    );

    // Generate PDF
    const pdf = generateBidPDF({
      projectId,
      clientName,
      propertyAddress,
      coverLetter,
      costEstimate,
    });

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="SCE-Bid-${projectId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error generating bid:', error);
    return res.status(500).json({ error: 'Failed to generate bid' });
  }
}
