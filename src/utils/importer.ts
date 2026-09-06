import * as XLSX from 'xlsx';
import type { Framework, ControlItem, AssessmentRecord, ComplianceStatus, CMMILevel, Priority } from '../types';

export function parseFrameworkFromJSON(jsonString: string): Framework {
  const parsed = JSON.parse(jsonString);
  if (!parsed.name || !parsed.domains || !parsed.controls) {
    throw new Error('Invalid JSON framework format. Missing required fields (name, domains, controls).');
  }
  return {
    ...parsed,
    id: parsed.id || `custom-${Date.now()}`,
    code: parsed.code || 'CUSTOM',
    category: parsed.category || 'Cybersecurity',
    jurisdiction: parsed.jurisdiction || 'Custom'
  };
}

export function parseFrameworkFromExcel(fileBuffer: ArrayBuffer, frameworkName = 'Custom Framework'): Framework {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

  if (rows.length === 0) {
    throw new Error('Excel sheet is empty.');
  }

  const domainsMap = new Map<string, { id: string; code: string; name: string }>();
  const controls: ControlItem[] = [];
  const frameworkId = `custom-${Date.now()}`;

  rows.forEach((row, idx) => {
    const domainName = row['Domain'] || row['domain'] || row['Category'] || 'General Controls';
    const domainId = `DOM-${domainName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;

    if (!domainsMap.has(domainId)) {
      domainsMap.set(domainId, {
        id: domainId,
        code: `D${domainsMap.size + 1}`,
        name: domainName
      });
    }

    const controlId = String(row['Control ID'] || row['ID'] || row['ControlId'] || `CTRL-${idx + 1}`);
    const title = String(row['Title'] || row['Control Name'] || row['Name'] || `Control ${idx + 1}`);
    const description = String(row['Description'] || row['Requirement'] || row['Control Description'] || '');
    const guidance = row['Guidance'] || row['Implementation Guidance'] || '';
    const weight = Number(row['Weight'] || row['Priority'] || 5);

    controls.push({
      id: controlId,
      frameworkId,
      domainId,
      domainName,
      subDomain: row['Sub Domain'] || row['SubDomain'] || '',
      title,
      description,
      implementationGuidance: guidance,
      weight: isNaN(weight) ? 5 : weight
    });
  });

  return {
    id: frameworkId,
    code: 'CUSTOM',
    name: frameworkName,
    version: '1.0',
    category: 'Custom',
    jurisdiction: 'Custom',
    description: `Imported framework with ${controls.length} controls across ${domainsMap.size} domains.`,
    domains: Array.from(domainsMap.values()),
    controls
  };
}

export function exportFrameworkTemplateExcel(): void {
  const headers = [
    'Control ID',
    'Domain',
    'Sub Domain',
    'Title',
    'Description',
    'Implementation Guidance',
    'Weight (1-10)'
  ];

  const sampleRows = [
    {
      'Control ID': 'GOV-01',
      'Domain': 'Cybersecurity Governance',
      'Sub Domain': 'Strategy & Policy',
      'Title': 'Cybersecurity Strategy Document',
      'Description': 'The organization must establish a comprehensive cybersecurity strategy approved by leadership.',
      'Implementation Guidance': 'Document strategy aligned with ISO 27001 / NCA ECC frameworks.',
      'Weight (1-10)': 10
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: headers });
  worksheet['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 30 }, { wch: 50 }, { wch: 40 }, { wch: 15 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Custom Framework Template');
  XLSX.writeFile(workbook, 'Compliance_Framework_Template.xlsx');
}

/**
 * Generates and downloads a client questionnaire spreadsheet (.xlsx) for any chosen standard.
 * Includes existing assessment answers if already assessed.
 */
export function exportClientQuestionnaireExcel(
  framework: Framework,
  assessments: AssessmentRecord[],
  clientName = 'Client Organization'
): void {
  const assessmentMap = new Map<string, AssessmentRecord>();
  assessments.forEach(a => assessmentMap.set(a.controlId, a));

  const questionnaireData = framework.controls.map((ctrl, index) => {
    const record = assessmentMap.get(ctrl.id);
    return {
      'Index': index + 1,
      'Control ID': ctrl.id,
      'Domain': ctrl.domainName,
      'Sub-Clause': ctrl.subDomain || '',
      'Title': ctrl.title,
      'Requirement / Standard Clause': ctrl.description,
      'Implementation Guidance & Objectives': ctrl.implementationGuidance || '',
      'Recommended & Required Evidence Documents': (ctrl.requiredEvidence || []).join('\n• '),
      'Client Compliance Status (Compliant / Partially Compliant / Non-Compliant / Not Applicable)': 
        record?.status === 'COMPLIANT' ? 'Compliant' :
        record?.status === 'PARTIALLY_COMPLIANT' ? 'Partially Compliant' :
        record?.status === 'NON_COMPLIANT' ? 'Non-Compliant' :
        record?.status === 'NOT_APPLICABLE' ? 'Not Applicable' : '',
      'CMMI Maturity Level (0-5)': record?.cmmiLevel ?? '',
      'Compliance Score % (0-100)': record?.scorePercent ?? '',
      'Client Response / Implementation Details': record?.finding || '',
      'Attached Evidence / Reference Links': record?.auditorNotes || '',
      'Remediation Action Plan (If Gap)': record?.remediationPlan || '',
      'Action Priority (Critical / High / Medium / Low)': record?.actionPriority || 'Medium',
      'Responsible Person / Assignee': record?.assignedTo || '',
      'Target Completion Due Date (YYYY-MM-DD)': record?.dueDate || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(questionnaireData);
  
  // Set generous column widths
  ws['!cols'] = [
    { wch: 8 },   // Index
    { wch: 18 },  // Control ID
    { wch: 28 },  // Domain
    { wch: 20 },  // Sub-Clause
    { wch: 35 },  // Title
    { wch: 55 },  // Requirement
    { wch: 45 },  // Guidance
    { wch: 50 },  // Recommended Evidence Documents
    { wch: 30 },  // Status
    { wch: 15 },  // CMMI
    { wch: 15 },  // Score %
    { wch: 45 },  // Client Response
    { wch: 35 },  // Evidence Links
    { wch: 40 },  // Remediation
    { wch: 18 },  // Priority
    { wch: 25 },  // Assignee
    { wch: 20 }   // Due Date
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${framework.name.substring(0, 25)} Questionnaire`);
  
  // Clean filename
  const cleanName = framework.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
  XLSX.writeFile(wb, `${cleanName}_Client_Questionnaire.xlsx`);
}

/**
 * Parses an answered client questionnaire spreadsheet (.xlsx) and extracts assessment records.
 */
export function parseAnsweredQuestionnaire(
  fileBuffer: ArrayBuffer,
  frameworkId: string,
  projectId: string
): AssessmentRecord[] {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(firstSheet);

  if (rows.length === 0) {
    throw new Error('The uploaded questionnaire file is empty.');
  }

  const records: AssessmentRecord[] = [];

  rows.forEach((row, idx) => {
    const controlId = String(row['Control ID'] || row['ID'] || row['ControlId'] || '').trim();
    if (!controlId) return;

    const rawStatus = String(
      row['Client Compliance Status (Compliant / Partially Compliant / Non-Compliant / Not Applicable)'] ||
      row['Client Compliance Status'] ||
      row['Status'] ||
      row['Compliance Status'] ||
      ''
    ).trim().toLowerCase();

    let status: ComplianceStatus = 'NOT_ASSESSED';
    if (rawStatus.includes('partially') || rawStatus === 'partial' || rawStatus.includes('جزئي')) {
      status = 'PARTIALLY_COMPLIANT';
    } else if (rawStatus.includes('non') || rawStatus.includes('not compliant') || rawStatus.includes('غير') || rawStatus === 'gap' || rawStatus === 'no') {
      status = 'NON_COMPLIANT';
    } else if (rawStatus.includes('applicable') || rawStatus === 'na' || rawStatus === 'n/a' || rawStatus.includes('ينطبق')) {
      status = 'NOT_APPLICABLE';
    } else if (rawStatus.includes('compliant') || rawStatus === 'yes' || rawStatus.includes('ملتزم') || rawStatus.includes('مطبق')) {
      status = 'COMPLIANT';
    }

    const rawCmmi = Number(row['CMMI Maturity Level (0-5)'] || row['CMMI'] || row['Maturity Level']);
    const cmmiLevel: CMMILevel = (!isNaN(rawCmmi) && rawCmmi >= 0 && rawCmmi <= 5) ? (rawCmmi as CMMILevel) : (status === 'COMPLIANT' ? 4 : status === 'PARTIALLY_COMPLIANT' ? 2 : 0);

    const rawScore = Number(row['Compliance Score % (0-100)'] || row['Score'] || row['Percentage']);
    const scorePercent = !isNaN(rawScore) ? rawScore : (status === 'COMPLIANT' ? 100 : status === 'PARTIALLY_COMPLIANT' ? 50 : 0);

    const finding = String(
      row['Client Response / Implementation Details'] ||
      row['Client Response'] ||
      row['Implementation Details'] ||
      row['Findings'] ||
      ''
    ).trim();

    const auditorNotes = String(
      row['Attached Evidence / Reference Links'] ||
      row['Evidence Notes'] ||
      row['Auditor Notes'] ||
      ''
    ).trim();

    const remediationPlan = String(
      row['Remediation Action Plan (If Gap)'] ||
      row['Remediation Plan'] ||
      row['Action Plan'] ||
      ''
    ).trim();

    const rawPriority = String(
      row['Action Priority (Critical / High / Medium / Low)'] ||
      row['Priority'] ||
      'MEDIUM'
    ).trim().toUpperCase();

    let actionPriority: Priority = 'MEDIUM';
    if (rawPriority.includes('CRIT') || rawPriority.includes('حرج')) actionPriority = 'CRITICAL';
    else if (rawPriority.includes('HIGH') || rawPriority.includes('عالي')) actionPriority = 'HIGH';
    else if (rawPriority.includes('LOW') || rawPriority.includes('منخفض')) actionPriority = 'LOW';

    const assignedTo = String(row['Responsible Person / Assignee'] || row['Assignee'] || '').trim();
    const dueDate = String(row['Target Completion Due Date (YYYY-MM-DD)'] || row['Due Date'] || '').trim();

    records.push({
      id: `assess-${controlId}`,
      projectId,
      controlId,
      frameworkId,
      status,
      cmmiLevel,
      scorePercent,
      finding,
      auditorNotes,
      applicabilityReason: '',
      evidenceIds: [],
      remediationPlan,
      actionPriority,
      assignedTo,
      dueDate,
      remediationCostEstimate: '',
      isRemediated: false,
      lastUpdated: new Date().toISOString()
    });
  });

  return records;
}
