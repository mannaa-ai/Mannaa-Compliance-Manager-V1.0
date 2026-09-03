import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Project, Framework, AssessmentRecord } from '../types';
import { calculateFrameworkScores } from './scoring';

export function exportExecutivePDF(
  project: Project,
  framework: Framework,
  assessments: AssessmentRecord[]
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const summary = calculateFrameworkScores(framework, assessments);

  // Theme Colors
  const primaryColor = [15, 23, 42]; // Slate 900
  const brandBlue = [37, 99, 235]; // Blue 600
  const successColor = [22, 163, 74];
  const warningColor = [234, 179, 8];
  const dangerColor = [220, 38, 38];

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE COMPLIANCE AUDIT REPORT', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Framework: ${framework.name} (${framework.version})`, 14, 26);
  doc.text(`Organization: ${project.organizationName} | Lead Auditor: ${project.leadAuditor}`, 14, 33);
  doc.text(`Date Generated: ${new Date().toLocaleDateString('en-GB')}`, 140, 33);

  // Executive Score Summary Cards
  doc.setDrawColor(226, 232, 240);
  
  // Card 1: Status Score
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 48, 58, 28, 3, 3, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text('OVERALL COMPLIANCE', 18, 55);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  doc.text(`${summary.overallStatusScore}%`, 18, 67);

  // Card 2: CMMI Maturity
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(76, 48, 58, 28, 3, 3, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CMMI MATURITY (0-5)', 80, 55);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${summary.overallCmmiMaturity} / 5.0`, 80, 67);

  // Card 3: Weighted Risk Score
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(138, 48, 58, 28, 3, 3, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('WEIGHTED RISK SCORE', 142, 55);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(summary.overallWeightedScore >= 80 ? successColor[0] : warningColor[0], summary.overallWeightedScore >= 80 ? successColor[1] : warningColor[1], summary.overallWeightedScore >= 80 ? successColor[2] : warningColor[2]);
  doc.text(`${summary.overallWeightedScore}%`, 142, 67);

  // Section: Status Breakdown Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Domain Compliance Breakdown', 14, 86);

  const domainTableData = summary.domainBreakdown.map(d => [
    d.domainName,
    `${d.assessedControls} / ${d.totalControls}`,
    `${d.compliantCount}`,
    `${d.partiallyCompliantCount}`,
    `${d.nonCompliantCount}`,
    `${d.statusScorePercentage}%`,
    `${d.averageCmmiLevel} / 5`
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['Domain', 'Assessed', 'Compliant', 'Partial', 'Non-Comp', 'Compliance %', 'Avg CMMI']],
    body: domainTableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 70 },
      5: { fontStyle: 'bold' }
    }
  });

  // Section: High Risk Findings & Corrective Actions
  const lastY = (doc as any).lastAutoTable.finalY || 150;
  
  if (lastY > 210) {
    doc.addPage();
    doc.text('2. Critical & High Priority Remediation Items', 14, 20);
  } else {
    doc.text('2. Critical & High Priority Remediation Items', 14, lastY + 12);
  }

  const findingRows: any[] = [];
  framework.controls.forEach(ctrl => {
    const record = assessments.find(a => a.controlId === ctrl.id);
    if (record && (record.actionPriority === 'CRITICAL' || record.actionPriority === 'HIGH' || record.status === 'NON_COMPLIANT')) {
      findingRows.push([
        ctrl.id,
        ctrl.title,
        record.status,
        record.actionPriority || 'HIGH',
        record.finding || 'Non-compliance gap identified during evaluation.',
        record.remediationPlan || 'Establish policies & technical controls.',
        record.dueDate || 'TBD'
      ]);
    }
  });

  const nextStartY = lastY > 210 ? 25 : lastY + 16;

  autoTable(doc, {
    startY: nextStartY,
    head: [['Control ID', 'Title', 'Status', 'Priority', 'Deficiency / Finding', 'Remediation Plan', 'Due']],
    body: findingRows.length > 0 ? findingRows : [['-', 'No critical gaps identified', 'COMPLIANT', 'LOW', 'All assessed controls met benchmark requirements.', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 }
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Full Compliance Manager - Confidential Audit Deliverable | Page ${i} of ${pageCount}`,
      14,
      290
    );
  }

  doc.save(`${project.organizationName.replace(/\s+/g, '_')}_${framework.code}_Audit_Report.pdf`);
}

export function exportDetailedExcel(
  project: Project,
  framework: Framework,
  assessments: AssessmentRecord[]
): void {
  const assessmentMap = new Map<string, AssessmentRecord>();
  assessments.forEach(a => assessmentMap.set(a.controlId, a));

  const rows = framework.controls.map(ctrl => {
    const record = assessmentMap.get(ctrl.id);
    return {
      'Framework': framework.name,
      'Domain ID': ctrl.domainId,
      'Domain Name': ctrl.domainName,
      'Sub Domain': ctrl.subDomain || '',
      'Control ID': ctrl.id,
      'Control Title': ctrl.title,
      'Description / Requirement': ctrl.description,
      'Guidance': ctrl.implementationGuidance || '',
      'Compliance Status': record?.status || 'NOT_ASSESSED',
      'CMMI Level (0-5)': record?.cmmiLevel ?? '',
      'Score %': record?.scorePercent ?? '',
      'Applicability Reason': record?.applicabilityReason || '',
      'Finding / Gap Analysis': record?.finding || '',
      'Auditor Notes': record?.auditorNotes || '',
      'Remediation Action Plan': record?.remediationPlan || '',
      'Action Priority': record?.actionPriority || '',
      'Assigned To': record?.assignedTo || '',
      'Target Due Date': record?.dueDate || '',
      'Remediated?': record?.isRemediated ? 'YES' : 'NO',
      'Associated Evidence Count': record?.evidenceIds?.length || 0,
      'Cross Mappings': ctrl.mappedControls?.join('; ') || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Gap Analysis & Audit Matrix');

  // Add Summary Sheet
  const summary = calculateFrameworkScores(framework, assessments);
  const summaryRows = [
    { 'Metric': 'Organization Name', 'Value': project.organizationName },
    { 'Metric': 'Lead Auditor', 'Value': project.leadAuditor },
    { 'Metric': 'Framework', 'Value': framework.name },
    { 'Metric': 'Overall Compliance %', 'Value': `${summary.overallStatusScore}%` },
    { 'Metric': 'CMMI Maturity (0-5)', 'Value': `${summary.overallCmmiMaturity}` },
    { 'Metric': 'Weighted Risk Score', 'Value': `${summary.overallWeightedScore}%` },
    { 'Metric': 'Total Controls', 'Value': summary.totalControls },
    { 'Metric': 'Assessed Controls', 'Value': summary.assessedControls },
    { 'Metric': 'Compliant Controls', 'Value': summary.statusDistribution.compliant },
    { 'Metric': 'Partially Compliant', 'Value': summary.statusDistribution.partiallyCompliant },
    { 'Metric': 'Non-Compliant Controls', 'Value': summary.statusDistribution.nonCompliant },
    { 'Metric': 'Not Applicable', 'Value': summary.statusDistribution.notApplicable }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

  XLSX.writeFile(workbook, `${project.organizationName.replace(/\s+/g, '_')}_${framework.code}_Audit_Matrix.xlsx`);
}

export function exportStatementOfApplicability(
  project: Project,
  framework: Framework,
  assessments: AssessmentRecord[]
): void {
  const assessmentMap = new Map<string, AssessmentRecord>();
  assessments.forEach(a => assessmentMap.set(a.controlId, a));

  const soaRows = framework.controls.map(ctrl => {
    const record = assessmentMap.get(ctrl.id);
    const isApplicable = record?.status !== 'NOT_APPLICABLE';
    return {
      'Control ID': ctrl.id,
      'Control Title': ctrl.title,
      'Domain': ctrl.domainName,
      'Applicability': isApplicable ? 'Applicable' : 'Exempted / Not Applicable',
      'Justification / Rationale': isApplicable
        ? 'Mandatory organizational security control / legal requirement.'
        : (record?.applicabilityReason || 'Out of organizational scope.'),
      'Implementation Status': record?.status || 'NOT_ASSESSED',
      'Evidence References': (record?.evidenceIds?.length || 0) > 0 ? `${record?.evidenceIds?.length} artifact(s) attached` : 'Pending documentation'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(soaRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Statement of Applicability');
  XLSX.writeFile(workbook, `${project.organizationName.replace(/\s+/g, '_')}_Statement_of_Applicability_SoA.xlsx`);
}
