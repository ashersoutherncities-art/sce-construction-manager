import { jsPDF } from 'jspdf';
import { CostEstimate } from './openai';

interface BidData {
  projectId: string;
  clientName: string;
  propertyAddress: string;
  coverLetter: string;
  costEstimate: CostEstimate;
  paymentTerms?: string;
  termsAndConditions?: string;
}

export function generateBidPDF(data: BidData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Colors
  const navy = '#132452';
  const orange = '#fa8c41';

  // Header with branding
  doc.setFillColor(19, 36, 82); // Navy
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Southern Cities Construction', margin, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(250, 140, 65); // Orange
  doc.text('General Contracting Division', margin, 30);

  yPosition = 50;

  // Project Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Project ID: ${data.projectId}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 15;

  // Client Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared For:', margin, yPosition);
  yPosition += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(data.clientName, margin, yPosition);
  yPosition += 5;
  doc.text(data.propertyAddress, margin, yPosition);
  yPosition += 15;

  // Cover Letter
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(19, 36, 82); // Navy
  doc.text('Proposal', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const letterLines = doc.splitTextToSize(data.coverLetter, pageWidth - 2 * margin);
  letterLines.forEach((line: string) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(line, margin, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // New page for bid details
  doc.addPage();
  yPosition = margin;

  // Bid Breakdown Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(19, 36, 82);
  doc.text('Detailed Bid Breakdown', margin, yPosition);
  yPosition += 12;

  // Table Header
  doc.setFillColor(19, 36, 82);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Category/Task', margin + 2, yPosition);
  doc.text('Labor', pageWidth - 80, yPosition);
  doc.text('Materials', pageWidth - 50, yPosition);
  doc.text('Total', pageWidth - margin - 2, yPosition, { align: 'right' });
  
  yPosition += 10;

  // Line Items
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  data.costEstimate.lineItems.forEach((item) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Category header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(item.category, margin + 2, yPosition);
    yPosition += 6;

    // Task details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const taskLines = doc.splitTextToSize(item.task, pageWidth - 130);
    taskLines.forEach((line: string, idx: number) => {
      doc.text(line, margin + 5, yPosition);
      if (idx === 0) {
        doc.text(`$${item.laborCost.toLocaleString()}`, pageWidth - 80, yPosition);
        doc.text(`$${item.materialCost.toLocaleString()}`, pageWidth - 50, yPosition);
        doc.text(
          `$${(item.laborCost + item.materialCost).toLocaleString()}`,
          pageWidth - margin - 2,
          yPosition,
          { align: 'right' }
        );
      }
      yPosition += 5;
    });

    if (item.timeline) {
      doc.setTextColor(100, 100, 100);
      doc.text(`Timeline: ${item.timeline}`, margin + 5, yPosition);
      yPosition += 5;
      doc.setTextColor(0, 0, 0);
    }

    yPosition += 3;
  });

  // Totals
  yPosition += 5;
  doc.setDrawColor(19, 36, 82);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Subtotal:', pageWidth - 80, yPosition);
  doc.text(`$${data.costEstimate.subtotal.toLocaleString()}`, pageWidth - margin - 2, yPosition, {
    align: 'right',
  });
  yPosition += 7;

  doc.text('Contingency (10%):', pageWidth - 80, yPosition);
  doc.text(
    `$${data.costEstimate.contingency.toLocaleString()}`,
    pageWidth - margin - 2,
    yPosition,
    { align: 'right' }
  );
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(250, 140, 65); // Orange
  doc.text('Total Project Cost:', pageWidth - 80, yPosition);
  doc.text(`$${data.costEstimate.total.toLocaleString()}`, pageWidth - margin - 2, yPosition, {
    align: 'right',
  });

  yPosition += 15;

  // Timeline
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Estimated Timeline:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(data.costEstimate.estimatedTimeline, margin, yPosition);

  // Payment Terms
  doc.addPage();
  yPosition = margin;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(19, 36, 82);
  doc.text('Payment Terms', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const paymentTerms = data.paymentTerms || `
- 30% deposit upon contract signing
- 40% upon completion of rough-in stage
- 25% upon substantial completion
- 5% final payment upon project completion and approval
  `.trim();

  const paymentLines = doc.splitTextToSize(paymentTerms, pageWidth - 2 * margin);
  paymentLines.forEach((line: string) => {
    doc.text(line, margin, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Terms & Conditions
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(19, 36, 82);
  doc.text('Terms & Conditions', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const terms = data.termsAndConditions || `
1. This bid is valid for 30 days from the date of issue.
2. All work will be completed in accordance with local building codes and regulations.
3. Any changes to the scope of work will require a written change order.
4. Southern Cities Construction is licensed and insured.
5. A certificate of insurance will be provided upon request.
6. Final payment is due upon completion and client approval.
7. All materials are guaranteed for one year from completion date.
  `.trim();

  const termsLines = doc.splitTextToSize(terms, pageWidth - 2 * margin);
  termsLines.forEach((line: string) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(line, margin, yPosition);
    yPosition += 5;
  });

  // Footer on last page
  yPosition = pageHeight - 30;
  doc.setFillColor(19, 36, 82);
  doc.rect(0, yPosition, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Southern Cities Construction', pageWidth / 2, yPosition + 10, { align: 'center' });
  doc.setFontSize(8);
  doc.text(
    'Charlotte, NC | contact@southerncities.com',
    pageWidth / 2,
    yPosition + 16,
    { align: 'center' }
  );

  return doc;
}
