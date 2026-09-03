import React from 'react';
import type { Project, Framework, AssessmentRecord, EvidenceItem } from '../types';
import { 
  FileText, 
  FileSpreadsheet, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Sparkles
} from 'lucide-react';
import { exportExecutivePDF, exportDetailedExcel, exportStatementOfApplicability } from '../utils/exporter';
import { calculateFrameworkScores } from '../utils/scoring';

interface ReportsViewProps {
  project: Project;
  framework: Framework;
  assessments: AssessmentRecord[];
  evidenceList: EvidenceItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  project,
  framework,
  assessments,
  evidenceList
}) => {
  const summary = calculateFrameworkScores(framework, assessments);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" /> Audit Deliverables & Documentation
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Audit Reports & Export Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal compliance deliverables for regulators (NCA, SAMA) and certification bodies (ISO 27001, ISO 22301, ISO 42001).
          </p>
        </div>
      </div>

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deliverable 1: Executive PDF */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-100">Executive Summary PDF</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Formal boardroom-ready PDF deliverable containing executive score cards, domain compliance breakdown, and critical remediation roadmap.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => exportExecutivePDF(project, framework, assessments)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Export Executive PDF
            </button>
          </div>
        </div>

        {/* Deliverable 2: Detailed Excel Gap Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-100">Comprehensive Excel Audit Matrix</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Full multi-tab spreadsheet with all controls, scoring models (Status, CMMI, Score %), auditor findings, remediation tasks, and cross-framework tags.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => exportDetailedExcel(project, framework, assessments)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Export Excel Gap Matrix
            </button>
          </div>
        </div>

        {/* Deliverable 3: Statement of Applicability (SoA) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-100">Statement of Applicability (SoA)</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Mandatory ISO 27001 / ISO 22301 / NCA deliverable documenting the inclusion or exclusion rationale and implementation justification for every control.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => exportStatementOfApplicability(project, framework, assessments)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Export SoA Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Audit Readiness Summary Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Audit Readiness Checklist for {framework.name}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-slate-400">Controls Assessed</div>
              <div className="text-base font-bold text-slate-100 mt-0.5">{summary.assessedControls} / {summary.totalControls}</div>
            </div>
            <span className="text-xs font-semibold text-blue-400">{summary.completionRate}%</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-slate-400">Total Deficiencies / Findings</div>
              <div className="text-base font-bold text-rose-400 mt-0.5">{summary.remediationStats.totalFindings} Open Gaps</div>
            </div>
            <span className="text-xs font-semibold text-rose-400">{summary.remediationStats.criticalFindings} Critical</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-slate-400">Evidence Attached</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{evidenceList.length} Artifacts</div>
            </div>
            <span className="text-xs font-semibold text-emerald-400">Vault Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
