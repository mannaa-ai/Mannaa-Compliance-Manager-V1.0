import React, { useState, useEffect } from 'react';
import type { Framework, AssessmentRecord, ControlItem } from '../types';
import type { Language } from '../utils/i18n';
import { calculateFrameworkScores } from '../utils/scoring';
import { 
  BarChart3, 
  Tv, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  Award,
  Layers
} from 'lucide-react';

interface ExecutiveHeatmapViewProps {
  framework: Framework;
  assessments: AssessmentRecord[];
  clientName?: string;
  lang?: Language;
  theme?: 'dark' | 'light';
}

interface HeatmapCellControl {
  control: ControlItem;
  record?: AssessmentRecord;
  likelihood: number; // 1-5
  impact: number;     // 1-5
  riskScore: number;  // likelihood * impact (1-25)
}

export const ExecutiveHeatmapView: React.FC<ExecutiveHeatmapViewProps> = ({
  framework,
  assessments,
  clientName = 'Enterprise Organization',
  lang = 'ar',
  theme = 'dark'
}) => {
  const isRtl = lang === 'ar';
  const summary = calculateFrameworkScores(framework, assessments);

  const [boardroomMode, setBoardroomMode] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ likelihood: number; impact: number } | null>(null);

  const assessmentMap = new Map<string, AssessmentRecord>();
  assessments.forEach(a => assessmentMap.set(a.controlId, a));

  // Compute Likelihood and Impact for each control
  const mappedControls: HeatmapCellControl[] = framework.controls.map(ctrl => {
    const record = assessmentMap.get(ctrl.id);
    const status = record?.status || 'NOT_ASSESSED';
    const priority = record?.actionPriority || 'MEDIUM';

    let likelihood = 2;
    let impact = 2;

    if (status === 'NON_COMPLIANT') {
      if (priority === 'CRITICAL') {
        likelihood = 5;
        impact = 5;
      } else if (priority === 'HIGH') {
        likelihood = 4;
        impact = 4;
      } else if (priority === 'MEDIUM') {
        likelihood = 3;
        impact = 3;
      } else {
        likelihood = 2;
        impact = 2;
      }
    } else if (status === 'PARTIALLY_COMPLIANT') {
      if (priority === 'CRITICAL') {
        likelihood = 4;
        impact = 4;
      } else if (priority === 'HIGH') {
        likelihood = 3;
        impact = 4;
      } else {
        likelihood = 2;
        impact = 3;
      }
    } else if (status === 'NOT_ASSESSED') {
      likelihood = 3;
      impact = 3;
    } else if (status === 'NOT_APPLICABLE') {
      likelihood = 1;
      impact = 1;
    } else {
      // COMPLIANT
      likelihood = 1;
      impact = 1;
    }

    return {
      control: ctrl,
      record,
      likelihood,
      impact,
      riskScore: likelihood * impact
    };
  });

  // Top Strengths (Compliant with high CMMI)
  const topStrengths = mappedControls
    .filter(m => m.record?.status === 'COMPLIANT')
    .sort((a, b) => (b.record?.cmmiLevel || 0) - (a.record?.cmmiLevel || 0))
    .slice(0, 5);

  // Top Critical Priorities (Non-compliant with high riskScore)
  const topPriorities = mappedControls
    .filter(m => m.record?.status === 'NON_COMPLIANT' || m.record?.status === 'PARTIALLY_COMPLIANT')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  // Keyboard navigation for Boardroom Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!boardroomMode) return;
      if (e.key === 'ArrowRight') {
        if (isRtl) setActiveSlide(s => Math.max(0, s - 1));
        else setActiveSlide(s => Math.min(4, s + 1));
      } else if (e.key === 'ArrowLeft') {
        if (isRtl) setActiveSlide(s => Math.min(4, s + 1));
        else setActiveSlide(s => Math.max(0, s - 1));
      } else if (e.key === 'Escape') {
        setBoardroomMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [boardroomMode, isRtl]);

  const getCellControls = (l: number, imp: number) => {
    return mappedControls.filter(m => m.likelihood === l && m.impact === imp);
  };

  const getCellBgColor = (l: number, imp: number) => {
    const score = l * imp;
    if (score >= 16) return 'bg-rose-600/30 hover:bg-rose-600/50 border-rose-500/40 text-rose-300';
    if (score >= 10) return 'bg-orange-600/30 hover:bg-orange-600/50 border-orange-500/40 text-orange-300';
    if (score >= 6) return 'bg-amber-600/25 hover:bg-amber-600/45 border-amber-500/40 text-amber-300';
    return 'bg-emerald-600/20 hover:bg-emerald-600/40 border-emerald-500/30 text-emerald-300';
  };

  const selectedControlsList = selectedCell ? getCellControls(selectedCell.likelihood, selectedCell.impact) : [];

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`p-6 space-y-6 max-w-7xl mx-auto font-['Cairo'] transition-colors duration-300 ${
        theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* Header Banner with Boardroom Presentation Launcher */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" /> {isRtl ? 'تحليلات المخاطر التنفيذية' : 'Executive Risk Intelligence'}
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            {isRtl ? 'مصفوفة المخاطر التفاعلية وعرض مجلس الإدارة' : '5x5 Risk Heatmap & Boardroom Presentation Suite'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl ? 'تقييم تركيز المخاطر، احتمالية الحدوث، والأثر الرقابي وتقديم ملخص استراتيجي للقيادة التنفيذية.' : 'Dynamic likelihood vs. impact risk concentration matrix with executive boardroom presentation deck.'}
          </p>
        </div>

        <button
          onClick={() => {
            setActiveSlide(0);
            setBoardroomMode(true);
          }}
          className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition"
        >
          <Tv className="w-4 h-4" />
          <span>{isRtl ? 'تشغيل عرض مجلس الإدارة (Boardroom Mode)' : 'Launch Boardroom Deck'}</span>
        </button>
      </div>

      {/* Main Grid: 5x5 Heatmap Matrix + Selected Cell Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main (8 Cols): 5x5 Matrix */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{isRtl ? 'مصفوفة المخاطر (الاحتمالية × الأثر)' : 'Risk Matrix (Likelihood × Impact)'}</span>
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {isRtl ? 'منخفض' : 'Low (1-5)'}</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> {isRtl ? 'متوسط' : 'Med (6-9)'}</span>
              <span className="flex items-center gap-1 text-orange-400"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> {isRtl ? 'عالي' : 'High (10-15)'}</span>
              <span className="flex items-center gap-1 text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> {isRtl ? 'حرج' : 'Critical (16-25)'}</span>
            </div>
          </div>

          {/* Matrix Container */}
          <div className="overflow-x-auto pt-2">
            <div className="min-w-[500px]">
              {/* Y-Axis Label: Likelihood */}
              <div className="grid grid-cols-6 gap-2">
                <div className="text-center font-bold text-[11px] text-slate-400 flex items-center justify-center">
                  <span className="-rotate-90 text-[10px] tracking-wider uppercase text-emerald-400">{isRtl ? 'الاحتمالية' : 'Likelihood'}</span>
                </div>
                {[1, 2, 3, 4, 5].map(imp => (
                  <div key={imp} className="text-center font-bold text-[10px] text-slate-400 pb-1">
                    {imp === 1 && (isRtl ? '١: ضئيل' : '1: Negligible')}
                    {imp === 2 && (isRtl ? '٢: طفيف' : '2: Minor')}
                    {imp === 3 && (isRtl ? '٣: متوسط' : '3: Moderate')}
                    {imp === 4 && (isRtl ? '٤: كبير' : '4: Major')}
                    {imp === 5 && (isRtl ? '٥: كارثي' : '5: Catastrophic')}
                  </div>
                ))}
              </div>

              {/* Rows (Likelihood 5 down to 1) */}
              {[5, 4, 3, 2, 1].map(l => (
                <div key={l} className="grid grid-cols-6 gap-2 mb-2">
                  <div className="font-bold text-[10px] text-slate-400 flex items-center justify-end pr-2">
                    {l === 5 && (isRtl ? '٥: شبه مؤكد' : '5: Almost Certain')}
                    {l === 4 && (isRtl ? '٤: محتمل جداً' : '4: Likely')}
                    {l === 3 && (isRtl ? '٣: ممكن' : '3: Possible')}
                    {l === 2 && (isRtl ? '٢: غير محتمل' : '2: Unlikely')}
                    {l === 1 && (isRtl ? '١: نادر' : '1: Rare')}
                  </div>

                  {[1, 2, 3, 4, 5].map(imp => {
                    const cellCtrls = getCellControls(l, imp);
                    const isSelected = selectedCell?.likelihood === l && selectedCell?.impact === imp;

                    return (
                      <button
                        key={`${l}-${imp}`}
                        onClick={() => setSelectedCell({ likelihood: l, impact: imp })}
                        className={`h-16 rounded-xl border p-2 flex flex-col justify-between transition cursor-pointer ${getCellBgColor(l, imp)} ${
                          isSelected ? 'ring-2 ring-white scale-102 shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between w-full text-[10px] font-bold opacity-80">
                          <span>{l * imp}</span>
                          <span>L{l}×I{imp}</span>
                        </div>
                        <div className="text-right text-base font-extrabold">
                          {cellCtrls.length > 0 ? `${cellCtrls.length}` : '-'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* X-Axis Label: Impact */}
              <div className="text-center text-[10px] font-bold text-emerald-400 tracking-wider uppercase pt-2">
                {isRtl ? 'الأثر والضرر الرقابي / المالي (Impact)' : 'Regulatory & Financial Impact'}
              </div>
            </div>
          </div>
        </div>

        {/* Right (4 Cols): Cell Inspector & Risk Breakdown */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{isRtl ? 'تفاصيل المربع المحدد' : 'Selected Risk Cell Inspector'}</span>
              {selectedCell && (
                <span className="text-[10px] text-slate-300 font-bold px-2 py-0.5 rounded bg-slate-800">
                  L{selectedCell.likelihood} × I{selectedCell.impact} ({selectedCell.likelihood * selectedCell.impact} Pts)
                </span>
              )}
            </h3>

            {selectedCell ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-300">
                  {selectedControlsList.length} {isRtl ? 'ضوابط تقع ضمن هذا التصنيف من المخاطر' : 'controls in this risk category'}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {selectedControlsList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      {isRtl ? 'لا توجد ضوابط في هذه الخلية' : 'No controls in this cell'}
                    </div>
                  ) : (
                    selectedControlsList.map(item => (
                      <div key={item.control.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between font-bold text-emerald-400 mb-0.5">
                          <span>{item.control.id}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
                            {item.record?.status || 'NOT_ASSESSED'}
                          </span>
                        </div>
                        <div className="text-slate-200 line-clamp-1 font-semibold">{item.control.title}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{item.control.domainName}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                {isRtl ? 'انقر على أي خلية في المصفوفة لعرض الضوابط التابعة لها' : 'Click on any cell in the heatmap matrix to inspect controls.'}
              </div>
            )}
          </div>

          {/* Domain Risk Concentration */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isRtl ? 'تركيز المخاطر حسب المجال' : 'Domain Risk Concentration'}
            </h3>

            <div className="space-y-2">
              {summary.domainBreakdown.slice(0, 4).map(d => (
                <div key={d.domainName} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="truncate pr-2 max-w-[170px]">
                    <div className="font-bold text-slate-200 truncate">{d.domainName}</div>
                    <div className="text-[10px] text-slate-500">{d.nonCompliantCount} Gaps • {d.assessedControls} Controls</div>
                  </div>
                  <span className={`text-xs font-bold ${d.statusScorePercentage >= 80 ? 'text-emerald-400' : d.statusScorePercentage >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {d.statusScorePercentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Boardroom Presentation Modal (Full-Screen Slide Deck) */}
      {boardroomMode && (
        <div className="fixed inset-0 z-50 bg-[#060b13] text-slate-100 flex flex-col justify-between p-8 backdrop-blur-md animate-fade-in select-none">
          {/* Deck Top Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
                A
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-wider uppercase text-emerald-400">
                  {clientName} • Boardroom Compliance Briefing
                </h2>
                <p className="text-xs text-slate-400 font-semibold">{framework.name} ({framework.version})</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400">
                Slide {activeSlide + 1} of 5
              </span>
              <button
                onClick={() => setBoardroomMode(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slide Content Area */}
          <div className="flex-1 flex items-center justify-center py-6">
            {/* Slide 1: Executive Overview & Scorecards */}
            {activeSlide === 0 && (
              <div className="max-w-4xl w-full space-y-8 animate-fade-in">
                <div className="text-center space-y-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    EXECUTIVE SUMMARY
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-100">Overall Cybersecurity & Compliance Posture</h1>
                  <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                    High-level assessment results benchmarking {clientName}'s governance and operational defense against {framework.name}.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-2 shadow-xl">
                    <div className="text-xs font-bold text-slate-400 uppercase">Overall Compliance Level</div>
                    <div className="text-5xl font-black text-emerald-400">{summary.overallStatusScore}%</div>
                    <p className="text-[11px] text-slate-500">Benchmark requirement: ≥ 85%</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-2 shadow-xl">
                    <div className="text-xs font-bold text-slate-400 uppercase">CMMI Maturity Rating</div>
                    <div className="text-5xl font-black text-blue-400">{summary.overallCmmiMaturity} <span className="text-xl text-slate-500">/ 5.0</span></div>
                    <p className="text-[11px] text-slate-500">Institutionalized & Managed</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-2 shadow-xl">
                    <div className="text-xs font-bold text-slate-400 uppercase">Controls Assessed</div>
                    <div className="text-5xl font-black text-purple-400">{summary.assessedControls} <span className="text-xl text-slate-500">/ {summary.totalControls}</span></div>
                    <p className="text-[11px] text-slate-500">{summary.completionRate}% Audit Completion</p>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 2: Domain Readiness Breakdown */}
            {activeSlide === 1 && (
              <div className="max-w-4xl w-full space-y-6 animate-fade-in">
                <div className="text-center space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    PILLARS & DOMAINS
                  </span>
                  <h1 className="text-3xl font-black text-slate-100">Cybersecurity Pillar Performance</h1>
                </div>

                <div className="space-y-3">
                  {summary.domainBreakdown.map(d => (
                    <div key={d.domainName} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1 flex-1 pr-6">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-200">{d.domainName}</span>
                          <span className="text-emerald-400">{d.statusScorePercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${d.statusScorePercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right text-xs font-semibold text-slate-400 min-w-[100px]">
                        {d.compliantCount} Compliant / {d.totalControls} Total
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slide 3: Top 5 Strengths */}
            {activeSlide === 2 && (
              <div className="max-w-4xl w-full space-y-6 animate-fade-in">
                <div className="text-center space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    KEY ACHIEVEMENTS
                  </span>
                  <h1 className="text-3xl font-black text-slate-100">Top 5 Compliance Strengths & Safeguards</h1>
                </div>

                <div className="space-y-3">
                  {topStrengths.map((item, idx) => (
                    <div key={item.control.id} className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-emerald-400">{item.control.id}</span>
                          <span className="text-xs text-slate-400 font-bold">{item.control.domainName}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-100">{item.control.title}</div>
                        <div className="text-xs text-slate-400 mt-1 line-clamp-2">{item.control.description}</div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 shrink-0">
                        CMMI {item.record?.cmmiLevel || 4}/5
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slide 4: Critical Remediation Priorities */}
            {activeSlide === 3 && (
              <div className="max-w-4xl w-full space-y-6 animate-fade-in">
                <div className="text-center space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    EXECUTIVE ACTION ITEMS
                  </span>
                  <h1 className="text-3xl font-black text-slate-100">Top 5 Critical Remediation Priorities</h1>
                  <p className="text-xs text-slate-400">Items requiring immediate resource allocation & board sponsorship.</p>
                </div>

                <div className="space-y-3">
                  {topPriorities.length > 0 ? (
                    topPriorities.map((item, idx) => (
                      <div key={item.control.id} className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 flex items-start gap-4">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-rose-400">{item.control.id}</span>
                            <span className="text-xs text-slate-400 font-bold">{item.control.domainName}</span>
                          </div>
                          <div className="text-sm font-bold text-slate-100">{item.control.title}</div>
                          <div className="text-xs text-rose-300 mt-1 font-semibold">
                            Remediation: {item.record?.remediationPlan || 'Establish administrative policy and configure technical control enforcement.'}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-rose-400 px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/30">
                            {item.record?.actionPriority || 'HIGH'}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">Due: {item.record?.dueDate || '30 Days'}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-emerald-400">
                      All assessed controls have met high-compliance status!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Slide 5: Board Conclusion & Next Steps */}
            {activeSlide === 4 && (
              <div className="max-w-3xl w-full space-y-6 text-center animate-fade-in">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  STRATEGIC ROADMAP
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-100">Audit Roadmap & Strategic Milestones</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div className="font-bold text-slate-200 text-sm">Policy Ratification</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ratify and formally publish the outstanding organizational policies across all operational business units.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div className="font-bold text-slate-200 text-sm">Technical Implementation</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Enforce MFA, centralized SIEM logging, endpoint defense, and automated backup immutable verification.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div className="font-bold text-slate-200 text-sm">Official Certification</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Submit official NCA Hasseen compliance filing and initiate Stage 2 certification audit with accredited body.
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setBoardroomMode(false)}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    Exit Presentation Mode
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Deck Bottom Controls */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
            <button
              onClick={() => setActiveSlide(s => Math.max(0, s - 1))}
              disabled={activeSlide === 0}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Slide Dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map(idx => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-3 h-3 rounded-full transition ${
                    activeSlide === idx ? 'bg-emerald-500 scale-125' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveSlide(s => Math.min(4, s + 1))}
              disabled={activeSlide === 4}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white disabled:opacity-40 transition flex items-center gap-2"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
