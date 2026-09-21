import Dexie, { type Table } from 'dexie';
import type { Project, AssessmentRecord, EvidenceItem, Framework, AuditLogEntry } from '../types';

export class ComplianceDB extends Dexie {
  projects!: Table<Project, string>;
  assessments!: Table<AssessmentRecord, string>;
  evidence!: Table<EvidenceItem, string>;
  customFrameworks!: Table<Framework, string>;
  auditLogs!: Table<AuditLogEntry, string>;

  constructor() {
    super('FullComplianceManagerDB');
    this.version(1).stores({
      projects: 'id, name, organizationName, status, lastModifiedDate',
      assessments: 'id, projectId, controlId, frameworkId, status, cmmiLevel, [projectId+frameworkId], [projectId+controlId]',
      evidence: 'id, projectId, type, uploadedAt',
      customFrameworks: 'id, code, category, jurisdiction'
    });
    this.version(2).stores({
      projects: 'id, name, organizationName, status, lastModifiedDate',
      assessments: 'id, projectId, controlId, frameworkId, status, cmmiLevel, [projectId+frameworkId], [projectId+controlId]',
      evidence: 'id, projectId, type, uploadedAt',
      customFrameworks: 'id, code, category, jurisdiction',
      auditLogs: 'id, projectId, action, timestamp, sequenceNumber'
    });
  }
}

export const db = new ComplianceDB();

