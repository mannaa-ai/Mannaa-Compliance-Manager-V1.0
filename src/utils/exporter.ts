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
    headStyles: { fillColor: [dangerColor[0], dangerColor[1], dangerColor[2]], textColor: 255, fontStyle: 'bold' },
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

/**
 * Module 4: NCA "Hasseen" (حصين) Official Regulatory Submission Export (Excel)
 * Conforms precisely with the National Cybersecurity Authority (NCA) compliance portal structure.
 */
export function exportNcaHasseenFormat(
  project: Project,
  framework: Framework,
  assessments: AssessmentRecord[]
): void {
  const assessmentMap = new Map<string, AssessmentRecord>();
  assessments.forEach(a => assessmentMap.set(a.controlId, a));

  const summary = calculateFrameworkScores(framework, assessments);

  // 1. Entity & Submission Metadata
  const metadataRows = [
    { 'NCA Hasseen Portal Specification': 'Entity Legal Name / اسم الجهة', 'Value / القيمة': project.organizationName },
    { 'NCA Hasseen Portal Specification': 'Regulatory Framework / الإطار التنظيمي', 'Value / القيمة': `${framework.name} (${framework.code})` },
    { 'NCA Hasseen Portal Specification': 'Submission Reference / المرجع', 'Value / القيمة': `NCA-HASSEEN-${Date.now().toString(36).toUpperCase()}` },
    { 'NCA Hasseen Portal Specification': 'Lead Cybersecurity Officer / CISO', 'Value / القيمة': project.leadAuditor },
    { 'NCA Hasseen Portal Specification': 'Assessment Date / تاريخ التقييم', 'Value / القيمة': new Date().toLocaleDateString('en-GB') },
    { 'NCA Hasseen Portal Specification': 'Overall Compliance Level / نسبة الالتزام الإجمالية', 'Value / القيمة': `${summary.overallStatusScore}%` },
    { 'NCA Hasseen Portal Specification': 'CMMI Maturity Index / مؤشر النضج', 'Value / القيمة': `${summary.overallCmmiMaturity} / 5.0` },
    { 'NCA Hasseen Portal Specification': 'Total Assessed Controls / إجمالي الضوابط المقيمة', 'Value / القيمة': `${summary.assessedControls} / ${summary.totalControls}` },
    { 'NCA Hasseen Portal Specification': 'Compliant Controls / الضوابط الملتزمة', 'Value / القيمة': summary.statusDistribution.compliant },
    { 'NCA Hasseen Portal Specification': 'Partially Compliant / ملتزمة جزئياً', 'Value / القيمة': summary.statusDistribution.partiallyCompliant },
    { 'NCA Hasseen Portal Specification': 'Non-Compliant / غير ملتزمة', 'Value / القيمة': summary.statusDistribution.nonCompliant },
    { 'NCA Hasseen Portal Specification': 'Exempted / Not Applicable / لا تنطبق', 'Value / القيمة': summary.statusDistribution.notApplicable }
  ];

  // 2. NCA Hasseen Controls Grid
  const hasseenRows = framework.controls.map((ctrl, idx) => {
    const record = assessmentMap.get(ctrl.id);
    const status = record?.status || 'NOT_ASSESSED';

    // Status mapping in English & Arabic for NCA Portal
    let statusAr = 'غير مقيم (Not Assessed)';
    let ncaComplianceTag = 'Pending';
    if (status === 'COMPLIANT') {
      statusAr = 'ملتزم كلياً (Fully Compliant)';
      ncaComplianceTag = 'Compliant';
    } else if (status === 'PARTIALLY_COMPLIANT') {
      statusAr = 'ملتزم جزئياً (Partially Compliant)';
      ncaComplianceTag = 'Partially Compliant';
    } else if (status === 'NON_COMPLIANT') {
      statusAr = 'غير ملتزم (Non-Compliant)';
      ncaComplianceTag = 'Non-Compliant';
    } else if (status === 'NOT_APPLICABLE') {
      statusAr = 'لا ينطبق (Not Applicable)';
      ncaComplianceTag = 'Not Applicable';
    }

    return {
      'Seq #': idx + 1,
      'Main Domain (المجال الأساسي)': ctrl.domainName,
      'Sub-Domain (المجال الفرعي)': ctrl.subDomain || 'General',
      'Control Code / Reference (رمز الضابط)': ctrl.id,
      'Control Title (عنوان الضابط)': ctrl.title,
      'Regulatory Requirement Specification (نص الضابط ومتطلبات الالتزام)': ctrl.description,
      'Implementation Guidance (الإرشادات التنفيذية)': ctrl.implementationGuidance || '',
      'Applicability (قابلية التطبيق)': status === 'NOT_APPLICABLE' ? 'Non-Applicable / مستثنى' : 'Applicable / منطبق',
      'Compliance Status (حالة الالتزام)': statusAr,
      'NCA Portal Rating (تصنيف حصين)': ncaComplianceTag,
      'Compliance Score % (نسبة الاستيفاء)': record?.scorePercent !== undefined ? `${record.scorePercent}%` : '',
      'CMMI Maturity Level (مستوى النضج 0-5)': record?.cmmiLevel ?? '',
      'Auditor Evaluation & Gap Analysis (تحليل الفجوات وملاحظات التدقيق)': record?.finding || '',
      'Remediation Action Plan (خطة المعالجة والتصحيح)': record?.remediationPlan || '',
      'Action Priority (أولوية المعالجة)': record?.actionPriority || 'MEDIUM',
      'Remediation Target Date (تاريخ المعالجة المستهدف)': record?.dueDate || '',
      'Control Custodian / Department (الإدارة المسؤولة)': record?.assignedTo || 'Cybersecurity / IT Team',
      'Evidence Artifacts Attached (عدد الشواهد المرفقة)': record?.evidenceIds?.length || 0,
      'Exemption Justification (مبررات الاستثناء إن وجدت)': record?.applicabilityReason || ''
    };
  });

  const workbook = XLSX.utils.book_new();

  // Sheet 1: NCA Submission Info
  const metaSheet = XLSX.utils.json_to_sheet(metadataRows);
  XLSX.utils.book_append_sheet(workbook, metaSheet, 'Submission Metadata - بيانات التقديم');

  // Sheet 2: Official NCA Assessment Form
  const dataSheet = XLSX.utils.json_to_sheet(hasseenRows);
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'NCA Hasseen Audit - تقييم حصين');

  XLSX.writeFile(
    workbook,
    `${project.organizationName.replace(/\s+/g, '_')}_NCA_Hasseen_Submission_${framework.code}.xlsx`
  );
}

/**
 * Module 4: SAMA Cybersecurity Framework Formal Compliance Declaration Letter (PDF)
 * Official letter formatted for regulatory submission to the Saudi Central Bank (SAMA).
 */
export function exportSamaDeclarationLetter(
  project: Project,
  framework: Framework,
  assessments: AssessmentRecord[]
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const summary = calculateFrameworkScores(framework, assessments);

  // Palette
  const samaNavy = [15, 30, 65];
  const samaGold = [180, 140, 50];
  const textDark = [30, 41, 59];
  const borderGray = [226, 232, 240];

  // Letterhead Top Banner
  doc.setFillColor(samaNavy[0], samaNavy[1], samaNavy[2]);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setFillColor(samaGold[0], samaGold[1], samaGold[2]);
  doc.rect(0, 36, 210, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SAUDI CENTRAL BANK (SAMA) CYBERSECURITY FRAMEWORK', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(218, 225, 231);
  doc.text('FORMAL COMPLIANCE DECLARATION & STATEMENT OF ASSURANCE', 14, 25);
  doc.text(`Doc Ref: SAMA-DEC-${Date.now().toString(36).toUpperCase()}`, 145, 25);

  // Official Letter Metadata
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('To:', 14, 48);
  doc.setFont('helvetica', 'normal');
  doc.text('Cybersecurity Supervision Department, Saudi Central Bank (SAMA)', 25, 48);
  doc.text('Riyadh, Kingdom of Saudi Arabia', 25, 53);

  doc.setFont('helvetica', 'bold');
  doc.text('From:', 14, 61);
  doc.setFont('helvetica', 'normal');
  doc.text(`${project.organizationName}`, 28, 61);
  doc.text(`Lead Compliance / CISO: ${project.leadAuditor}`, 28, 66);
  doc.text(`Date of Issuance: ${new Date().toLocaleDateString('en-GB')}`, 145, 61);
  doc.text(`Applicable Mandate: SAMA CSF v1.0 / NCA Regulations`, 120, 66);

  // Horizontal divider
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(14, 72, 196, 72);

  // Declaration Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(samaNavy[0], samaNavy[1], samaNavy[2]);
  doc.text('SUBJECT: OFFICIAL STATEMENT OF CYBERSECURITY COMPLIANCE', 14, 80);

  // Declaration Paragraph
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const declarationText = `We, the executive management and cybersecurity leadership of ${project.organizationName}, hereby formally declare that a comprehensive cybersecurity assessment has been conducted against the mandated requirements of the ${framework.name} (${framework.version}). The assessment rigorously evaluated our organizational governance, technical safeguards, cybersecurity defense operations, and third-party risk management practices.`;
  
  const splitText = doc.splitTextToSize(declarationText, 182);
  doc.text(splitText, 14, 88);

  // Executive Compliance KPI Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(14, 106, 182, 28, 3, 3, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('OVERALL COMPLIANCE', 22, 114);
  doc.text('CMMI MATURITY RATING', 78, 114);
  doc.text('ASSESSED CONTROLS', 142, 114);

  doc.setFontSize(16);
  doc.setTextColor(samaNavy[0], samaNavy[1], samaNavy[2]);
  doc.text(`${summary.overallStatusScore}%`, 22, 126);
  doc.text(`${summary.overallCmmiMaturity} / 5.0`, 78, 126);
  doc.text(`${summary.assessedControls} / ${summary.totalControls}`, 142, 126);

  // Domain Breakdown Table
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(samaNavy[0], samaNavy[1], samaNavy[2]);
  doc.text('Summary of Domain Compliance & Control Posture:', 14, 143);

  const domainRows = summary.domainBreakdown.map(d => [
    d.domainName,
    `${d.assessedControls} / ${d.totalControls}`,
    `${d.compliantCount}`,
    `${d.partiallyCompliantCount}`,
    `${d.nonCompliantCount}`,
    `${d.statusScorePercentage}%`
  ]);

  autoTable(doc, {
    startY: 147,
    head: [['Cybersecurity Domain / Pillar', 'Assessed', 'Compliant', 'Partial', 'Non-Comp', 'Compliance %']],
    body: domainRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 30, 65], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 85 },
      5: { fontStyle: 'bold' }
    }
  });

  const finalTableY = (doc as any).lastAutoTable.finalY || 195;

  // Management Commitment Statement
  const commitmentY = finalTableY > 215 ? 20 : finalTableY + 8;
  if (finalTableY > 215) {
    doc.addPage();
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const commitmentClause = `Management Commitment: ${project.organizationName} commits to maintaining the necessary technical, administrative, and physical controls to ensure full resilience. Any identified remediation items and corrective action plans are prioritized with defined completion schedules under executive oversight.`;
  const splitCommitment = doc.splitTextToSize(commitmentClause, 182);
  doc.text(splitCommitment, 14, commitmentY);

  // Dual Signatures Section
  const sigY = commitmentY + 22;
  
  // Box 1: CISO Signature
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(14, sigY, 86, 38, 2, 2);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(samaNavy[0], samaNavy[1], samaNavy[2]);
  doc.text('CHIEF INFORMATION SECURITY OFFICER (CISO)', 18, sigY + 7);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Name: ${project.leadAuditor}`, 18, sigY + 15);
  doc.text('Signature: ______________________', 18, sigY + 25);
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 18, sigY + 33);

  // Box 2: CEO / Managing Director Signature
  doc.roundedRect(110, sigY, 86, 38, 2, 2);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(samaNavy[0], samaNavy[1], samaNavy[2]);
  doc.text('CHIEF EXECUTIVE OFFICER / MANAGING DIRECTOR', 114, sigY + 7);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Authorized Officer: Executive Leadership`, 114, sigY + 15);
  doc.text('Signature: ______________________', 114, sigY + 25);
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 114, sigY + 33);

  // Official Seal Note
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('This declaration is issued under official mandate for regulatory compliance submission to SAMA / NCA.', 14, sigY + 44);

  doc.save(`${project.organizationName.replace(/\s+/g, '_')}_SAMA_CSF_Declaration_Letter.pdf`);
}

