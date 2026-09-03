import React, { useMemo } from 'react';
import type { Framework, AssessmentRecord, Project } from '../types';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';
import { calculateFrameworkScores } from '../utils/scoring';
import { StandardLogoBadge } from './StandardLogoBadge';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  Layers,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { exportExecutivePDF, exportDetailedExcel } from '../utils/exporter';

interface OverviewProps {
  project: Project | null;
  framework: Framework | null;
  assessments: AssessmentRecord[];
  onNavigateToAssessment: () => void;
  lang?: Language;
  theme?: 'dark' | 'light';
}

export const Overview: React.FC<OverviewProps> = ({
  project,
  framework,
  assessments,
  onNavigateToAssessment,
  lang = 'ar',
  theme = 'dark'
}) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  if (!framework || !project) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Layers className="w-12 h-12 text-slate-400 mb-3" />
        <h2 className="text-lg font-bold">No Active Audit Framework Selected</h2>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          Please select a compliance standard from the sidebar.
        </p>
      </div>
    );
  }

  const summary = useMemo(() => {
    return calculateFrameworkScores(framework, assessments);
  }, [framework, assessments]);

  const radarData = summary.domainBreakdown.map(d => ({
    domain: d.domainName.length > 22 ? d.domainName.substring(0, 20) + '...' : d.domainName,
    fullDomain: d.domainName,
    complianceScore: d.statusScorePercentage,
    cmmiMaturity: (d.averageCmmiLevel / 5) * 100
  }));

  const pieData = [
    { name: t.compliant, value: summary.statusDistribution.compliant, color: '#10b981' },
    { name: t.partiallyCompliant, value: summary.statusDistribution.partiallyCompliant, color: '#f59e0b' },
    { name: t.nonCompliant, value: summary.statusDistribution.nonCompliant, color: '#ef4444' },
    { name: t.notApplicable, value: summary.statusDistribution.notApplicable, color: '#64748b' },
    { name: t.notAssessed, value: summary.statusDistribution.notAssessed, color: '#94a3b8' }
  ].filter(item => item.value > 0);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`p-6 space-y-6 max-w-7xl mx-auto font-['Cairo'] transition-colors duration-300 ${
        theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* Top Header Banner with Standard Logo Badge */}
      <div className={`p-6 rounded-3xl border flex flex-wrap items-center justify-between gap-4 shadow-xl transition-colors ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-[#0d1522] via-[#0f1d2e] to-[#0a2328] border-slate-800' 
          : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-emerald-200/80 shadow-slate-200/50'
      }`}>
        <div className="flex items-center gap-4">
          <StandardLogoBadge code={framework.code} size="lg" />
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-4 h-4" /> {t.complianceAnalytics}
            </div>
            <h1 className="text-xl sm:text-2xl font-black">{framework.name}</h1>
            <p className={`text-xs mt-0.5 max-w-2xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {framework.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportExecutivePDF(project, framework, assessments)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${
              theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-500" />
            <span>{t.exportPdfBtn}</span>
          </button>
          <button
            onClick={() => exportDetailedExcel(project, framework, assessments)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>{t.exportExcelBtn}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 3-Tier Status Compliance */}
        <div className={`p-5 rounded-2xl border shadow-sm ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span>{t.tieredStatus}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-500">
            {summary.overallStatusScore}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary.statusDistribution.compliant} {t.compliant} • {summary.statusDistribution.partiallyCompliant} {t.partiallyCompliant}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${summary.overallStatusScore}%` }} 
            />
          </div>
        </div>

        {/* Card 2: CMMI Maturity Level (0-5) */}
        <div className={`p-5 rounded-2xl border shadow-sm ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span>{t.cmmiMaturity}</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-500">
            {summary.overallCmmiMaturity} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary.overallCmmiMaturity >= 4 ? 'Predictable' : summary.overallCmmiMaturity >= 3 ? 'Defined' : summary.overallCmmiMaturity >= 2 ? 'Managed' : 'Initial'}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(summary.overallCmmiMaturity / 5) * 100}%` }} 
            />
          </div>
        </div>

        {/* Card 3: Weighted Risk Score */}
        <div className={`p-5 rounded-2xl border shadow-sm ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span>{t.customScore}</span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-black text-cyan-500">
            {summary.overallWeightedScore}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Risk & control weight adjusted
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${summary.overallWeightedScore}%` }} 
            />
          </div>
        </div>

        {/* Card 4: Audit Progress */}
        <div className={`p-5 rounded-2xl border shadow-sm ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span>Assessment Coverage</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-emerald-500">
            {summary.completionRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary.assessedControls} / {summary.totalControls} Controls Evaluated
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${summary.completionRate}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm">Domain Compliance Radar / Spider</h3>
            <span className="text-[11px] text-slate-400">Coverage per domain</span>
          </div>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <PolarAngleAxis dataKey="domain" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#475569', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                <Radar name="Compliance %" dataKey="complianceScore" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#334155' : '#cbd5e1', 
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    borderRadius: '12px', 
                    fontSize: '12px' 
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie */}
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm">Compliance Status Breakdown</h3>
            <span className="text-[11px] text-slate-400">Status Distribution</span>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#334155' : '#cbd5e1', 
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    borderRadius: '12px', 
                    fontSize: '12px' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-2">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {t.compliant} ({summary.statusDistribution.compliant})</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> {t.partiallyCompliant} ({summary.statusDistribution.partiallyCompliant})</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> {t.nonCompliant} ({summary.statusDistribution.nonCompliant})</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> {t.notApplicable} ({summary.statusDistribution.notApplicable})</div>
          </div>
        </div>
      </div>

      {/* Domain Breakdown Table */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <h3 className="font-extrabold text-sm">Domain Compliance Matrix</h3>
            <p className="text-xs text-slate-400">Score % and Maturity Level by Domain</p>
          </div>
          <button
            onClick={onNavigateToAssessment}
            className="text-xs text-emerald-500 hover:text-emerald-400 font-black flex items-center gap-1"
          >
            {t.controlsAssessment} &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] tracking-wider border-b font-extrabold ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <tr>
                <th className="py-3.5 px-4">Domain Name</th>
                <th className="py-3.5 px-4">Evaluated</th>
                <th className="py-3.5 px-4">Compliant</th>
                <th className="py-3.5 px-4">Partial</th>
                <th className="py-3.5 px-4">Non-Comp</th>
                <th className="py-3.5 px-4">Avg CMMI</th>
                <th className="py-3.5 px-4 text-right">Compliance %</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {summary.domainBreakdown.map(d => (
                <tr key={d.domainId} className={theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                  <td className="py-3.5 px-4 font-bold">
                    {d.domainName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {d.assessedControls} / {d.totalControls}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-500 font-bold">
                    {d.compliantCount}
                  </td>
                  <td className="py-3.5 px-4 text-amber-500 font-bold">
                    {d.partiallyCompliantCount}
                  </td>
                  <td className="py-3.5 px-4 text-rose-500 font-bold">
                    {d.nonCompliantCount}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-400">
                    {d.averageCmmiLevel} / 5
                  </td>
                  <td className="py-3.5 px-4 text-right font-black">
                    <span className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      {d.statusScorePercentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
