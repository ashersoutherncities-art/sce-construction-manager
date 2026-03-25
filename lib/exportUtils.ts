import type { ScopeOfWork, CostEstimate } from './openai';

interface Project {
  id: string;
  propertyAddress: string;
  clientName: string;
}

export async function downloadScopeOfWorkPDF(scopeOfWork: ScopeOfWork, project: Project) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('SCOPE OF WORK', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Property: ${project.propertyAddress}`, 20, 35);
  doc.text(`Project ID: ${project.id}`, 20, 42);
  doc.text(`Client: ${project.clientName}`, 20, 49);

  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(scopeOfWork.summary, 170);
  doc.text(summaryLines, 20, 60);

  let yPos = 60 + (summaryLines.length * 7) + 10;

  doc.setFontSize(14);
  doc.text('COST SUMMARY', 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Total Estimated Cost: $${scopeOfWork.totalEstimatedCost.toLocaleString()}`, 20, yPos);
  yPos += 7;
  doc.text(`Estimated ARV Increase: $${scopeOfWork.estimatedARVIncrease.toLocaleString()}`, 20, yPos);
  yPos += 15;

  doc.setFontSize(14);
  doc.text('RECOMMENDATIONS', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  scopeOfWork.recommendations.forEach(cat => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.text(cat.category, 20, yPos);
    yPos += 7;
    doc.setFontSize(10);
    cat.items.forEach(item => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${item.task}: $${item.estimatedCost.toLocaleString()} (${item.priority})`, 25, yPos);
      yPos += 6;
    });
    yPos += 5;
  });

  doc.save(`${project.id}-scope-of-work.pdf`);
}

export async function downloadScopeOfWorkExcel(scopeOfWork: ScopeOfWork, project: Project) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['SCOPE OF WORK'],
    ['Property', project.propertyAddress],
    ['Project ID', project.id],
    ['Client', project.clientName],
    [],
    ['Summary', scopeOfWork.summary],
    [],
    ['Total Estimated Cost', scopeOfWork.totalEstimatedCost],
    ['Estimated ARV Increase', scopeOfWork.estimatedARVIncrease],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Recommendations sheet
  const recsData: any[][] = [['Category', 'Task', 'Estimated Cost', 'Priority']];
  scopeOfWork.recommendations.forEach(cat => {
    cat.items.forEach(item => {
      recsData.push([cat.category, item.task, item.estimatedCost, item.priority]);
    });
  });
  const recsSheet = XLSX.utils.aoa_to_sheet(recsData);
  XLSX.utils.book_append_sheet(wb, recsSheet, 'Recommendations');

  XLSX.writeFile(wb, `${project.id}-scope-of-work.xlsx`);
}

export async function downloadCostEstimatePDF(costEstimate: CostEstimate, project: Project) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('DETAILED COST ESTIMATE', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Property: ${project.propertyAddress}`, 20, 35);
  doc.text(`Project ID: ${project.id}`, 20, 42);
  doc.text(`Client: ${project.clientName}`, 20, 49);

  const tableData = costEstimate.lineItems.map(item => [
    item.category,
    item.task,
    `$${item.laborCost.toLocaleString()}`,
    `$${item.materialCost.toLocaleString()}`,
    item.timeline,
  ]);

  (doc as any).autoTable({
    startY: 60,
    head: [['Category', 'Task', 'Labor', 'Materials', 'Timeline']],
    body: tableData,
    foot: [
      ['', '', '', 'Subtotal:', `$${costEstimate.subtotal.toLocaleString()}`],
      ['', '', '', 'Contingency (10%):', `$${costEstimate.contingency.toLocaleString()}`],
      ['', '', '', 'TOTAL:', `$${costEstimate.total.toLocaleString()}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [19, 36, 82] },
    footStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Estimated Timeline: ${costEstimate.estimatedTimeline}`, 20, finalY);

  doc.save(`${project.id}-cost-estimate.pdf`);
}

export async function downloadCostEstimateExcel(costEstimate: CostEstimate, project: Project) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const data: any[][] = [
    ['DETAILED COST ESTIMATE'],
    ['Property', project.propertyAddress],
    ['Project ID', project.id],
    ['Client', project.clientName],
    [],
    ['Category', 'Task', 'Labor Cost', 'Material Cost', 'Timeline'],
  ];

  costEstimate.lineItems.forEach(item => {
    data.push([
      item.category,
      item.task,
      item.laborCost,
      item.materialCost,
      item.timeline,
    ]);
  });

  data.push(
    [],
    ['', '', '', 'Subtotal', costEstimate.subtotal],
    ['', '', '', 'Contingency (10%)', costEstimate.contingency],
    ['', '', '', 'TOTAL', costEstimate.total],
    [],
    ['Estimated Timeline', costEstimate.estimatedTimeline]
  );

  const sheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, sheet, 'Cost Estimate');

  XLSX.writeFile(wb, `${project.id}-cost-estimate.xlsx`);
}
