import React, { useState, useEffect } from 'react';
import type { Project, Framework, AssessmentRecord, AuditSnapshot } from '../types';
import type { Language } from '../utils/i18n';
import { calculateFrameworkScores } from '../utils/scoring';
import { 
  TrendingUp, 
  Camera, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Trash2, 
  ArrowRight, 
  Layers, 
  Award,
  BarChart3,
  Check,
  Zap,
  Clock
} from 'lucide-react';

interface MilestoneProgressProps {
  project: Project;
  framework: Framework;
  assessments: AssessmentRecord[];
  currentUser: { name: string; role: string; email: string };
  lang?: Language;
  theme?: 'dark' | 'light';
}

const STORAGE_SNAPSHOTS_KEY = 'anmat_audit_milestones_snapshots';

export function getStoredSnapshots(projectId: string, frameworkId: string): AuditSnapshot[] {
  const raw = localStorage.getItem(STORAGE_SNAPSHOTS_KEY);
  if (raw) {
    try {
      const all: AuditSnapshot[] = JSON.parse(raw);
      return all.filter(s => s.projectId === projectId && s.frameworkId === frameworkId);
    } catch {
      // fallback
    }
  }
  return [];
}

export function saveStoredSnapshot(snapshot: AuditSnapshot): void {
  const raw = localStorage.getItem(STORAGE_SNAPSHOTS_KEY);
  let all: AuditSnapshot[] = [];
  if (raw) {
    try {
      all = JSON.parse(raw);
    } catch {
      all = [];
    }
  }
  all.push(snapshot);
  localStorage.setItem(STORAGE_SNAPSHOTS_KEY, JSON.stringify(all));
}

export function deleteStoredSnapshot(id: string): void {
  const raw = localStorage.getItem(STORAGE_SNAPSHOTS_KEY);
  if (raw) {
    try {
      const all: AuditSnapshot[] = JSON.parse(raw);
      const updated = all.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_SNAPSHOTS_KEY, JSON.stringify(updated));
    } catch {
      // fallback
    }
  }
}

export const MilestoneProgressView: React.FC<MilestoneProgressProps> = ({
  project,
  framework,
  assessments,
  currentUser,
  lang = 'ar',
  theme = 'dark'
}) => {
  const isRtl = lang === 'ar';

  const [snapshots, setSnapshots] = useState<AuditSnapshot[]>([]);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [milestoneName, setMilestoneName] = useState('');
  const [phase, setPhase] = useState<'PHASE_1_BASELINE' | 'PHASE_2_MID_REVIEW' | 'PHASE_3_FINAL' | 'CUSTOM'>('PHASE_1_BASELINE');
  const [notes, setNotes] = useState('');

  // Current Live Scores
  const liveSummary = calculateFrameworkScores(framework, assessments);

  // Selected comparison milestones
  const [baselineSnapshotId, setBaselineSnapshotId] = useState<string>('');
  const [targetSnapshotId, setTargetSnapshotId] = useState<string>('LIVE');

  useEffect(() => {
    loadSnapshots();
  }, [project.id, framework.id]);

  const loadSnapshots = () => {
    const list = getStoredSnapshots(project.id, framework.id);
    setSnapshots(list);
    if (list.length > 0 && !baselineSnapshotId) {
      setBaselineSnapshotId(list[0].id);
    }
  };

  const handleCaptureSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneName.trim()) return;

    const newSnapshot: AuditSnapshot = {
      id: `snap-${Date.now()}`,
      projectId: project.id,
      frameworkId: framework.id,
      milestoneName: milestoneName.trim(),
      phase,
      notes: notes.trim(),
      capturedAt: new Date().toISOString(),
      capturedBy: currentUser.name,
      complianceScore: liveSummary.overallStatusScore,
      cmmiMaturity: liveSummary.overallCmmiMaturity,
      totalControls: liveSummary.totalControls,
      compliantCount: liveSummary.statusDistribution.compliant,
      partiallyCompliantCount: liveSummary.statusDistribution.partiallyCompliant,
      nonCompliantCount: liveSummary.statusDistribution.nonCompliant,
      notApplicableCount: liveSummary.statusDistribution.notApplicable,
      assessmentRecords: JSON.parse(JSON.stringify(assessments))
    };

    saveStoredSnapshot(newSnapshot);
    loadSnapshots();
    setIsSnapshotModalOpen(false);
    setMilestoneName('');
    setNotes('');
  };

  const handleDeleteSnapshot = (id: string) => {
    if (!confirm(isRtl ? 'هل أنت متأكد من حذف هذه اللقطة الزمنية؟' : 'Are you sure you want to delete this milestone snapshot?')) return;
    deleteStoredSnapshot(id);
    loadSnapshots();
  };

  // Baseline Data & Target Data
  const baselineSnap = snapshots.find(s => s.id === baselineSnapshotId);
  const targetData = targetSnapshotId === 'LIVE' 
    ? {
        name: isRtl ? 'التقييم الحي الحالي (Live Assessment)' : 'Current Live Assessment',
        score: liveSummary.overallStatusScore,
        cmmi: liveSummary.overallCmmiMaturity,
        compliant: liveSummary.statusDistribution.compliant,
        partiallyCompliant: liveSummary.statusDistribution.partiallyCompliant,
        nonCompliant: liveSummary.statusDistribution.nonCompliant
      }
    : (() => {
        const tSnap = snapshots.find(s => s.id === targetSnapshotId);
        return {
          name: tSnap?.milestoneName || 'Target',
          score: tSnap?.complianceScore || 0,
          cmmi: tSnap?.cmmiMaturity || 0,
          compliant: tSnap?.compliantCount || 0,
          partiallyCompliant: tSnap?.partiallyCompliantCount || 0,
          nonCompliant: tSnap?.nonCompliantCount || 0
        };
      })();

  const baselineData = baselineSnap 
    ? {
        name: baselineSnap.milestoneName,
        score: baselineSnap.complianceScore,
        cmmi: baselineSnap.cmmiMaturity,
        compliant: baselineSnap.compliantCount,
        partiallyCompliant: baselineSnap.partiallyCompliantCount,
        nonCompliant: baselineSnap.nonCompliantCount
      }
    : null;

  // Delta calculations
  const scoreDelta = baselineData ? targetData.score - baselineData.score : 0;
  const cmmiDelta = baselineData ? Number((targetData.cmmi - baselineData.cmmi).toFixed(1)) : 0;
  const compliantDelta = baselineData ? targetData.compliant - baselineData.compliant : 0;
  const gapClosureCount = baselineData ? Math.max(0, baselineData.nonCompliant - targetData.nonCompliant) : 0;

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="p-6 space-y-6 max-w-7xl mx-auto font-['Cairo'] transition-colors duration-300"
    >
      {/* Top Banner */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black tracking-wider text-blue-400 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {isRtl ? 'تتبع المراحل ومؤشرات الأداء' : 'Audit Milestone Progress'}
              </span>
            </div>
            <h1 className="text-xl font-black">
              {isRtl ? 'مقارنة مراحل التدقيق: الفجوة الأولية vs إعادة التقييم' : 'Audit Milestones & Gap Progress Comparison'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {framework.name} • {project.organizationName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSnapshotModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{isRtl ? 'حفظ لقطة مرحلية (Snapshot)' : 'Capture Audit Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Milestone Comparison Selector Bar */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <span className="text-xs font-bold text-slate-400">{isRtl ? 'مرحلة الأساس (Baseline):' : 'Baseline Phase:'}</span>
          <select
            value={baselineSnapshotId}
            onChange={(e) => setBaselineSnapshotId(e.target.value)}
            className={`rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 border ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            {snapshots.length === 0 && <option value="">{isRtl ? 'لا توجد لقطات محفوظة بعد' : 'No snapshots saved yet'}</option>}
            {snapshots.map(s => (
              <option key={s.id} value={s.id}>
                {s.milestoneName} ({s.complianceScore}% - {new Date(s.capturedAt).toLocaleDateString('en-GB')})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <span className="text-xs font-bold text-slate-400">{isRtl ? 'المرحلة المستهدفة للمقارنة:' : 'Comparison Target:'}</span>
          <select
            value={targetSnapshotId}
            onChange={(e) => setTargetSnapshotId(e.target.value)}
            className={`rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 border ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="LIVE">{isRtl ? 'التقييم الحي الحالي (Live Assessment)' : 'Current Live Assessment'}</option>
            {snapshots.map(s => (
              <option key={s.id} value={s.id}>
                {s.milestoneName} ({s.complianceScore}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparative Progress Highlights Cards */}
      {baselineData ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="text-[11px] font-bold text-slate-400 mb-1">{isRtl ? 'نمو نسبة الامتثال الكلية' : 'Compliance Growth Delta'}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black">{targetData.score}%</span>
              <span className={`text-xs font-black ${scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">{isRtl ? `من ${baselineData.score}% في مرحلة الأساس` : `From ${baselineData.score}% at baseline`}</div>
          </div>

          <div className={`p-4 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="text-[11px] font-bold text-slate-400 mb-1">{isRtl ? 'مستوى النضج CMMI' : 'CMMI Maturity Delta'}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black">{targetData.cmmi} / 5</span>
              <span className={`text-xs font-black ${cmmiDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {cmmiDelta >= 0 ? `+${cmmiDelta}` : `${cmmiDelta}`}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">{isRtl ? `مقارنة بـ ${baselineData.cmmi} سابقاً` : `Compared to ${baselineData.cmmi} at baseline`}</div>
          </div>

          <div className={`p-4 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="text-[11px] font-bold text-slate-400 mb-1">{isRtl ? 'الفجوات التي تم إغلاقها' : 'Gaps Remediated & Closed'}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{gapClosureCount}</span>
              <span className="text-xs font-bold text-slate-400">{isRtl ? 'فجوة معالجة' : 'Gaps'}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">{isRtl ? 'تم تحويلها إلى ضوابط ملتزمة' : 'Successfully remediated'}</div>
          </div>

          <div className={`p-4 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="text-[11px] font-bold text-slate-400 mb-1">{isRtl ? 'الضوابط المطبقة كلياً' : 'Total Compliant Controls'}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-400">{targetData.compliant}</span>
              <span className="text-xs font-black text-emerald-400">+{compliantDelta}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">{isRtl ? `من أصل ${liveSummary.totalControls} ضابط` : `Out of ${liveSummary.totalControls} controls`}</div>
          </div>
        </div>
      ) : (
        <div className={`p-8 rounded-3xl border text-center space-y-3 ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <Camera className="w-10 h-10 text-slate-500 mx-auto" />
          <h2 className="text-sm font-bold">{isRtl ? 'لا توجد لقطة مرحلية محفوظة حتى الآن' : 'No Milestone Snapshots Captured Yet'}</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isRtl 
              ? 'احفظ لقطة مرحلية للتقييم الحالي (مثل تقييم الفجوة الأولي Phase 1) للبدء في تتبع التطور وإغلاق الفجوات.'
              : 'Capture a snapshot of your current audit state (e.g. Phase 1 Baseline Gap Analysis) to track improvement.'}
          </p>
          <button
            onClick={() => setIsSnapshotModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" /> {isRtl ? 'حفظ لقطة الأساس الآن' : 'Capture Baseline Now'}
          </button>
        </div>
      )}

      {/* Snapshots History Timeline */}
      <div className={`border rounded-3xl p-6 ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h2 className="text-sm font-extrabold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>{isRtl ? 'سجل اللقطات والمراحل الزمنية المحفوظة' : 'Audit Snapshot History & Timeline'}</span>
        </h2>

        {snapshots.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">{isRtl ? 'لا توجد سجلات مرحلية' : 'No milestone snapshots recorded.'}</div>
        ) : (
          <div className="space-y-3">
            {snapshots.map((snap, idx) => (
              <div 
                key={snap.id} 
                className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-2">
                      <span>{snap.milestoneName}</span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                        {snap.phase.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(snap.capturedAt).toLocaleString(isRtl ? 'ar-SA' : 'en-GB')} • {isRtl ? 'المقيّم:' : 'Auditor:'} {snap.capturedBy}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-400">{snap.complianceScore}%</div>
                    <div className="text-[10px] text-slate-500">CMMI: {snap.cmmiMaturity} / 5</div>
                  </div>

                  <button
                    onClick={() => handleDeleteSnapshot(snap.id)}
                    title={isRtl ? 'حذف اللقطة' : 'Delete Snapshot'}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Capture Modal */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 ${
            theme === 'dark' ? 'bg-[#0d1522] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-400">
                <Camera className="w-4 h-4" />
                <span>{isRtl ? 'حفظ لقطة مرحلية لنتائج التدقيق' : 'Capture Audit Milestone Snapshot'}</span>
              </div>
              <button onClick={() => setIsSnapshotModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCaptureSnapshot} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold mb-1">{isRtl ? 'اسم المرحلة / اللقطة' : 'Milestone Name'}</label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? 'مثال: تقييم الفجوة الأولي (Phase 1 Baseline)' : 'e.g. Phase 1 Baseline Gap Assessment'}
                  value={milestoneName}
                  onChange={(e) => setMilestoneName(e.target.value)}
                  className="w-full rounded-xl py-2 px-3 text-xs bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">{isRtl ? 'نوع المرحلة' : 'Audit Phase'}</label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as any)}
                  className="w-full rounded-xl py-2 px-3 text-xs bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="PHASE_1_BASELINE">{isRtl ? 'مرحلة 1: تقييم الفجوة الأساسي (Phase 1 Baseline)' : 'Phase 1: Baseline Gap Analysis'}</option>
                  <option value="PHASE_2_MID_REVIEW">{isRtl ? 'مرحلة 2: مراجعة منتصف الخطة والمعالجة (Phase 2 Mid-Review)' : 'Phase 2: Mid-Remediation Review'}</option>
                  <option value="PHASE_3_FINAL">{isRtl ? 'مرحلة 3: التدقيق النهائي والاعتماد (Phase 3 Final Certification)' : 'Phase 3: Final Certification Audit'}</option>
                  <option value="CUSTOM">{isRtl ? 'مرحلة مخصصة (Custom Milestone)' : 'Custom Milestone Snapshot'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">{isRtl ? 'ملاحظات وتفاصيل المرحلة' : 'Audit Notes & Scope'}</label>
                <textarea
                  rows={2}
                  placeholder={isRtl ? 'ملاحظات حول سياق التقييم أو النطاق المغطى...' : 'Context or scope notes for this milestone...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl py-2 px-3 text-xs bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">{isRtl ? 'النتيجة الحالية المحفوظة:' : 'Score to be captured:'}</span>
                <span className="font-bold text-emerald-400">{liveSummary.overallStatusScore}% (CMMI: {liveSummary.overallCmmiMaturity}/5)</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSnapshotModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg cursor-pointer"
                >
                  {isRtl ? 'حفظ اللقطة' : 'Save Snapshot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
