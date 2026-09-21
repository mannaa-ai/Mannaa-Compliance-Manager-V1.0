import React, { useState } from 'react';
import type { Framework, AssessmentRecord, ComplianceStatus, CMMILevel } from '../types';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';
import { 
  ArrowRightLeft, 
  Search, 
  Sparkles, 
  CheckCheck, 
  ShieldCheck, 
  Layers, 
  Zap, 
  TrendingUp, 
  Clock, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface CrossMappingProps {
  frameworks: Framework[];
  assessments: AssessmentRecord[];
  activeProjectId?: string;
  onBatchSaveAssessments?: (records: AssessmentRecord[]) => void;
  lang?: Language;
  theme?: 'dark' | 'light';
}

export const CrossMappingView: React.FC<CrossMappingProps> = ({ 
  frameworks,
  assessments = [],
  activeProjectId = 'default',
  onBatchSaveAssessments,
  lang = 'ar',
  theme = 'dark'
}) => {
  const isRtl = lang === 'ar';
  const t = translations[lang];

  const [sourceFwId, setSourceFwId] = useState(frameworks[0]?.id || '');
  const [search, setSearch] = useState('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncPreviewList, setSyncPreviewList] = useState<{
    sourceControlId: string;
    targetControlId: string;
    targetFrameworkId: string;
    targetFrameworkName: string;
    sourceStatus: ComplianceStatus;
    sourceScore: number;
    sourceCmmi: CMMILevel;
    sourceFinding: string;
  }[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const sourceFw = frameworks.find(f => f.id === sourceFwId) || frameworks[0];
  const mappedControls = sourceFw?.controls.filter(c => c.mappedControls && c.mappedControls.length > 0) || [];

  const filteredControls = mappedControls.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.mappedControls?.some(m => m.toLowerCase().includes(search.toLowerCase()))
  );

  // Compute "Assess Once, Comply with Many" Metrics
  const assessedSourceControls = sourceFw?.controls.filter(c => {
    const rec = assessments.find(a => a.controlId === c.id);
    return rec && rec.status !== 'NOT_ASSESSED';
  }) || [];

  const totalPossibleTargetClosures = mappedControls.reduce((acc, c) => acc + (c.mappedControls?.length || 0), 0);

  // Open Auto-Propagation Harmonization Modal
  const handlePrepareSync = () => {
    const preview: typeof syncPreviewList = [];

    // For every assessed control in source framework
    assessedSourceControls.forEach(srcCtrl => {
      const srcRec = assessments.find(a => a.controlId === srcCtrl.id);
      if (!srcRec || srcRec.status === 'NOT_ASSESSED') return;

      srcCtrl.mappedControls?.forEach(targetMappedId => {
        // Find which framework this target belongs to
        frameworks.forEach(targetFw => {
          if (targetFw.id === sourceFw.id) return; // skip same framework

          const matchingTargetCtrl = targetFw.controls.find(tc => 
            tc.id === targetMappedId || 
            targetMappedId.includes(tc.id) || 
            tc.id.includes(targetMappedId)
          );

          if (matchingTargetCtrl) {
            // Check if already assessed in target framework
            const existingTargetRec = assessments.find(a => a.controlId === matchingTargetCtrl.id && a.frameworkId === targetFw.id);
            
            // Only suggest if not assessed or if source has higher compliance
            if (!existingTargetRec || existingTargetRec.status === 'NOT_ASSESSED') {
              preview.push({
                sourceControlId: srcCtrl.id,
                targetControlId: matchingTargetCtrl.id,
                targetFrameworkId: targetFw.id,
                targetFrameworkName: targetFw.name,
                sourceStatus: srcRec.status,
                sourceScore: srcRec.scorePercent,
                sourceCmmi: srcRec.cmmiLevel,
                sourceFinding: srcRec.finding || ''
              });
            }
          }
        });
      });
    });

    setSyncPreviewList(preview);
    setIsSyncModalOpen(true);
  };

  // Execute Auto-Harmonization Batch Save
  const handleExecuteSync = () => {
    if (!onBatchSaveAssessments || syncPreviewList.length === 0) return;

    const newRecords: AssessmentRecord[] = syncPreviewList.map(item => ({
      id: `assess-${activeProjectId}-${item.targetControlId}`,
      projectId: activeProjectId,
      controlId: item.targetControlId,
      frameworkId: item.targetFrameworkId,
      status: item.sourceStatus,
      cmmiLevel: item.sourceCmmi,
      scorePercent: item.sourceScore,
      finding: item.sourceFinding ? `[Auto-Harmonized from ${item.sourceControlId}]: ${item.sourceFinding}` : `Harmonized compliance evaluation propagated from ${item.sourceControlId}.`,
      auditorNotes: `Harmonized via ANMAT Cross-Framework Mapping Engine.`,
      evidenceIds: [],
      remediationPlan: '',
      actionPriority: 'MEDIUM',
      lastUpdated: new Date().toISOString()
    }));

    onBatchSaveAssessments(newRecords);
    setIsSyncModalOpen(false);
    setNotification(
      isRtl 
        ? `تم بنجاح تطبيق المواءمة وتحديث ${newRecords.length} ضابط متطابق عبر المعايير المحددة!` 
        : `Successfully harmonized and propagated ${newRecords.length} matching controls across standards!`
    );
  };

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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black tracking-wider text-emerald-500 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {isRtl ? 'محرك المواءمة والتكامل الرقابي' : 'Harmonization & Interoperability'}
              </span>
            </div>
            <h1 className="text-xl font-black">
              {isRtl ? 'المواءمة بين المعايير: قيّم مرة واحدة، التزم بالجميع' : 'Assess Once, Comply with Many'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl ? 'الربط المتبادل بين المعايير الوطنية (NCA, SAMA, PDPL) والمواصفات الدولية (ISO 27001, NIST CSF)' : 'Cross-walk mapping matrix between Saudi National Regulations and Global Standards.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrepareSync}
            disabled={assessedSourceControls.length === 0}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition cursor-pointer disabled:opacity-40"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{isRtl ? 'المواءمة التلقائية لنتائج التدقيق' : 'Auto-Harmonize & Propagate'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="cursor-pointer text-slate-400 hover:text-slate-200">✕</button>
        </div>
      )}

      {/* Metrics Row: Effort Saved & Interoperability Ratio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">{isRtl ? 'الضوابط المترابطة في المعيار' : 'Mapped Standard Controls'}</div>
            <div className="text-lg font-black text-slate-100">{mappedControls.length} {isRtl ? 'ضابط' : 'Controls'}</div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">{isRtl ? 'تقييمات جاهزة للمواءمة' : 'Assessed & Ready to Sync'}</div>
            <div className="text-lg font-black text-emerald-500">{assessedSourceControls.length} {isRtl ? 'ضابط مقيّم' : 'Assessed'}</div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">{isRtl ? 'وفر الجهد المتوقع' : 'Estimated Effort Saved'}</div>
            <div className="text-lg font-black text-amber-400">
              {Math.min(100, Math.round((assessedSourceControls.length / Math.max(1, mappedControls.length)) * 100))}% {isRtl ? 'وفر بالتدقيق' : 'Reduction'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Source Standard Selector */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className={`w-4 h-4 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
          <input
            type="text"
            placeholder={isRtl ? 'ابحث برقم الضابط، المتطلب، أو المعايير المتقاطعة...' : 'Search mapped controls, titles, or references...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-xl py-2 text-xs focus:outline-none focus:border-emerald-500 transition border ${
              isRtl ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'
            } ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-bold">{isRtl ? 'المعيار المرجعي الأساسي:' : 'Source Standard:'}</label>
          <select
            value={sourceFwId}
            onChange={(e) => setSourceFwId(e.target.value)}
            className={`rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 border ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            {frameworks.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mapping Matrix Table */}
      <div className={`border rounded-3xl overflow-hidden shadow-sm ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`border-b font-bold uppercase tracking-wider text-[11px] ${
              theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <tr>
                <th className="p-4 w-44">{sourceFw?.name.split(' ')[0]} {isRtl ? 'رمز الضابط' : 'Control ID'}</th>
                <th className="p-4 w-80">{isRtl ? 'المتطلب والعنوان' : 'Title & Requirement'}</th>
                <th className="p-4">{isRtl ? 'المعايير المتقاطعة والمتكافئة' : 'Harmonized Standards & Mapped Clauses'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-medium">
              {filteredControls.map((ctrl) => {
                const isAssessed = assessments.some(a => a.controlId === ctrl.id && a.status !== 'NOT_ASSESSED');

                return (
                  <tr key={ctrl.id} className={`transition ${
                    theme === 'dark' ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                  }`}>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-emerald-500 text-xs">{ctrl.id}</span>
                        {isAssessed && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title={isRtl ? 'مقيّم' : 'Assessed'} />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">{ctrl.domainName}</div>
                    </td>

                    <td className="p-4 align-top">
                      <div className="font-bold text-slate-100">{ctrl.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">{ctrl.description}</div>
                    </td>

                    <td className="p-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {ctrl.mappedControls?.map((m) => {
                          const isIso = m.startsWith('ISO');
                          const isNist = m.startsWith('NIST');
                          const isNca = m.startsWith('ECC') || m.startsWith('CSCC') || m.startsWith('DCC') || m.startsWith('TCC');
                          const isSama = m.startsWith('SAMA');
                          const isPdpl = m.startsWith('PDPL');

                          return (
                            <span
                              key={m}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border transition ${
                                isPdpl ? 'bg-teal-500/10 text-teal-300 border-teal-500/30' :
                                isIso ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' :
                                isNist ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' :
                                isNca ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                                isSama ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                                'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {m}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Auto-Harmonization Sync Preview */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 ${
            theme === 'dark' ? 'bg-[#0d1522] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-500">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>{isRtl ? 'معاينة المواءمة التلقائية عبر المعايير' : 'Auto-Harmonization Sync Preview'}</span>
              </div>
              <button onClick={() => setIsSyncModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">✕</button>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-xs text-slate-300">
                {isRtl 
                  ? `تم العثور على (${syncPreviewList.length}) ضابط متطابق في المعايير الأخرى يمكن تحديثها مباشرة بنتائج تقييم هذا المعيار:` 
                  : `Found (${syncPreviewList.length}) matching controls in other active frameworks ready to be auto-propagated:`}
              </p>

              {syncPreviewList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {isRtl ? 'لا توجد تقييمات جديدة تحتاج للمواءمة في الوقت الحالي.' : 'No new unassessed matching controls found to synchronize.'}
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 p-2 rounded-2xl bg-slate-950 border border-slate-800">
                  {syncPreviewList.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-200">
                          <span className="text-emerald-400">{item.sourceControlId}</span>
                          <span className="mx-2 text-slate-500">➔</span>
                          <span className="text-blue-400">{item.targetControlId}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.targetFrameworkName}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.sourceStatus} ({item.sourceScore}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleExecuteSync}
                disabled={syncPreviewList.length === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg cursor-pointer disabled:opacity-40"
              >
                {isRtl ? `تأكيد المواءمة (${syncPreviewList.length} ضابط)` : `Confirm & Propagate (${syncPreviewList.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
