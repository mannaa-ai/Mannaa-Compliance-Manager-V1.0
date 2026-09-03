export type FrameworkType = 'NCA_ECC' | 'NCA_CSCC' | 'SAMA_CSF' | 'ISO_27001' | 'ISO_20000' | 'ISO_22301' | 'NIST_CSF' | 'ISO_42001' | 'CUSTOM';

export type ComplianceStatus = 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE' | 'NOT_ASSESSED';

export type CMMILevel = 0 | 1 | 2 | 3 | 4 | 5;

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ControlItem {
  id: string;
  frameworkId: string;
  domainId: string;
  domainName: string;
  subDomain?: string;
  title: string;
  description: string;
  objective?: string;
  implementationGuidance?: string;
  weight?: number;
  mappedControls?: string[];
}

export interface Framework {
  id: string;
  code: FrameworkType;
  name: string;
  version: string;
  category: 'Cybersecurity' | 'Information Security' | 'IT & Cloud' | 'Business Continuity' | 'AI Governance' | 'Custom';
  jurisdiction: 'Saudi Arabia' | 'International' | 'USA' | 'Global' | 'Custom';
  description: string;
  domains: {
    id: string;
    code: string;
    name: string;
    description?: string;
    weight?: number;
  }[];
  controls: ControlItem[];
}

export interface AssessmentRecord {
  id: string;
  projectId: string;
  controlId: string;
  frameworkId: string;
  status: ComplianceStatus;
  cmmiLevel: CMMILevel;
  scorePercent: number;
  applicabilityReason?: string;
  finding?: string;
  auditorNotes?: string;
  evidenceIds: string[];
  remediationPlan?: string;
  actionPriority?: Priority;
  assignedTo?: string;
  dueDate?: string;
  remediationCostEstimate?: string;
  isRemediated?: boolean;
  lastUpdated: string;
}

export interface EvidenceItem {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  type: 'FILE' | 'URL_LINK' | 'POLICY_DOC' | 'SCREENSHOT' | 'SYSTEM_LOG';
  fileName?: string;
  fileData?: string;
  fileSize?: number;
  fileType?: string;
  externalUrl?: string;
  tags?: string[];
  associatedControls: string[];
  uploadedAt: string;
}

export interface Project {
  id: string;
  name: string;
  organizationName: string;
  leadAuditor: string;
  selectedFrameworks: string[];
  createdDate: string;
  lastModifiedDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  notes?: string;
}
