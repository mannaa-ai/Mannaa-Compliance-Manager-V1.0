import React from 'react';
import type { Project, Framework, AssessmentRecord, EvidenceItem } from '../types';
import { 
  FileText, 
  FileSpreadsheet, 
  Download, 
  ShieldCheck,
  Building2,
  FileCheck2,
  Award
} from 'lucide-react';
import { 
  exportExecutivePDF, 
  exportDetailedExcel, 
  exportStatementOfApplicability,
  exportNcaHasseenFormat,
  exportSamaDeclarationLetter
} from '../utils/exporter';
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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" /> Audit Deliverables & Documentation
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Audit Reports & Official Regulatory Export Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal compliance deliverables for Saudi regulators (NCA Hasseen, SAMA CSF) and international certification bodies (ISO 27001, ISO 22301, NIST).
          </p>
        </div>
      </div>

      {/* Section 1: Official Saudi Regulatory Submissions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wider">
            <Building2 className="w-4 h-4" /> Official Saudi Regulatory Submissions (NCA & SAMA)
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Mandatory Saudi Compliance Formats
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deliverable: NCA Hasseen Portal Excel */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/60 transition shadow-lg shadow-emerald-950/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  NCA HASSEEN (حصين)
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                NCA "Hasseen" (حصين) Portal Submission Form
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Structured multi-sheet workbook matching the official National Cybersecurity Authority (NCA) Hasseen compliance portal layout, complete with Arabic & English domain classification, compliance ratings (ملتزم كلياً / جزئياً / غير ملتزم), remediation dates, and evidence attachments.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-900/40">
              <button
                onClick={() => exportNcaHasseenFormat(project, framework, assessments)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-900/30"
              >
                <Download className="w-4 h-4" /> Export NCA Hasseen Form (.xlsx)
              </button>
            </div>
          </div>

          {/* Deliverable: SAMA Declaration Letter */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/60 transition shadow-lg shadow-amber-950/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  SAMA CSF MANDATE
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                SAMA Compliance Declaration Letter
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Official formal statement of cybersecurity compliance addressed to the Saudi Central Bank (SAMA) Cybersecurity Supervision Department. Includes executive KPIs, domain posture breakdown, management commitment clause, and dual CISO & CEO formal signature blocks.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-900/40">
              <button
                onClick={() => exportSamaDeclarationLetter(project, framework, assessments)}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-amber-900/30"
              >
                <Download className="w-4 h-4" /> Export SAMA Declaration Letter (.pdf)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Standard Audit Deliverables */}
      <div className="space-y-4">
        <div className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-blue-400" /> Standard Audit Reports & Technical Worksheets
        </div>

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

