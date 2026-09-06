import React, { useState, useEffect, useRef } from 'react';
import type { Framework, ControlItem, AssessmentRecord, ComplianceStatus, CMMILevel, Priority, EvidenceItem } from '../types';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';
import { exportClientQuestionnaireExcel, parseAnsweredQuestionnaire } from '../utils/importer';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  MinusCircle, 
  HelpCircle, 
  Search, 
  Paperclip, 
  Save, 
  Check, 
  ExternalLink,
  Award,
  Download,
  Upload,
  CheckCheck,
  FileCheck,
  FileText,
  Sparkles
} from 'lucide-react';

interface AssessmentViewProps {
  framework: Framework;
  assessments: AssessmentRecord[];
  evidenceList: EvidenceItem[];
  onSaveAssessment: (record: AssessmentRecord) => void;
  onBatchSaveAssessments?: (records: AssessmentRecord[]) => void;
  onAttachEvidenceModal: (controlId: string) => void;
  lang?: Language;
  theme?: 'dark' | 'light';
  clientName?: string;
  projectId?: string;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  framework,
  assessments,
  evidenceList,
  onSaveAssessment,
  onBatchSaveAssessments,
  onAttachEvidenceModal,
  lang = 'ar',
  theme = 'dark',
  clientName = 'Client Organization',
  projectId = 'default'
}) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [importNotification, setImportNotification] = useState<string | null>(null);
  
  // Safe control selection
  const [activeControl, setActiveControl] = useState<ControlItem>(framework.controls[0] || {
    id: 'CTRL-01',
    frameworkId: framework.id,
    domainId: framework.domains[0]?.id || 'DOM-1',
    domainName: framework.domains[0]?.name || 'General',
    title: 'Control Requirement',
    description: 'No controls found in this standard.',
    weight: 5
  });

  // Whenever framework changes, update active control to first control of that framework
  useEffect(() => {
    if (framework && framework.controls && framework.controls.length > 0) {
      setActiveControl(framework.controls[0]);
    }
  }, [framework]);

  // Sync formState with activeControl
  const [formState, setFormState] = useState<AssessmentRecord>({
    id: `assess-${activeControl.id}`,
    projectId: 'default',
    controlId: activeControl.id,
    frameworkId: framework.id,
    status: 'NOT_ASSESSED',
    cmmiLevel: 0,
    scorePercent: 0,
    finding: '',
    auditorNotes: '',
    applicabilityReason: '',
    evidenceIds: [],
    remediationPlan: '',
    actionPriority: 'MEDIUM',
    assignedTo: '',
    dueDate: '',
    remediationCostEstimate: '',
    isRemediated: false,
    lastUpdated: new Date().toISOString()
  });

  const [showSavedNotification, setShowSavedNotification] = useState(false);

  useEffect(() => {
    const rec = assessments.find(a => a.controlId === activeControl.id) || {
      id: `assess-${activeControl.id}`,
      projectId: 'default',
      controlId: activeControl.id,
      frameworkId: framework.id,
      status: 'NOT_ASSESSED',
      cmmiLevel: 0,
      scorePercent: 0,
      finding: '',
      auditorNotes: '',
      applicabilityReason: '',
      evidenceIds: [],
      remediationPlan: '',
      actionPriority: 'MEDIUM',
      assignedTo: '',
      dueDate: '',
      remediationCostEstimate: '',
      isRemediated: false,
      lastUpdated: new Date().toISOString()
    };
    setFormState(rec);
  }, [activeControl, assessments, framework.id]);

  const handleSelectControl = (ctrl: ControlItem) => {
    setActiveControl(ctrl);
  };

  const handleSave = () => {
    onSaveAssessment({
      ...formState,
      projectId,
      lastUpdated: new Date().toISOString()
    });
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 2000);
  };

  // Questionnaire Download Handler
  const handleDownloadQuestionnaire = () => {
    exportClientQuestionnaireExcel(framework, assessments, clientName);
  };

  // Questionnaire Upload & Ingestion Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const records = parseAnsweredQuestionnaire(buffer, framework.id, projectId);
      
      if (onBatchSaveAssessments) {
        onBatchSaveAssessments(records);
      } else {
        for (const r of records) {
          onSaveAssessment(r);
        }
      }

      setImportNotification(`${t.questionnaireImportSuccess} (${records.length} ${isRtl ? 'ضابط تم تحديثه' : 'controls updated'})`);
      setTimeout(() => setImportNotification(null), 5000);
    } catch (err: any) {
      alert(`Error reading questionnaire: ${err.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filter controls
  const filteredControls = (framework.controls || []).filter(ctrl => {
    const rec = assessments.find(a => a.controlId === ctrl.id);
    const status = rec?.status || 'NOT_ASSESSED';

    const matchesDomain = selectedDomain === 'ALL' || ctrl.domainId === selectedDomain;
    const matchesStatus = selectedStatus === 'ALL' || status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      ctrl.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ctrl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ctrl.description && ctrl.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDomain && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'COMPLIANT':
        return <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg"><CheckCircle2 className="w-3 h-3" /> {t.compliant}</span>;
      case 'PARTIALLY_COMPLIANT':
        return <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg"><AlertCircle className="w-3 h-3" /> {t.partiallyCompliant}</span>;
      case 'NON_COMPLIANT':
        return <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-lg"><XCircle className="w-3 h-3" /> {t.nonCompliant}</span>;
      case 'NOT_APPLICABLE':
        return <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/30 px-2 py-0.5 rounded-lg"><MinusCircle className="w-3 h-3" /> {t.notApplicable}</span>;
      default:
        return <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-lg"><HelpCircle className="w-3 h-3" /> {t.notAssessed}</span>;
    }
  };

  const attachedEvidence = evidenceList.filter(e => formState.evidenceIds?.includes(e.id));

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`h-[calc(100vh-2rem)] flex flex-col overflow-hidden p-4 font-['Cairo'] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#060b13] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Hidden File Input for Questionnaire Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Success Notification Banner for Questionnaire Upload */}
      {importNotification && (
        <div className="mb-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            <span>{importNotification}</span>
          </div>
          <button 
            onClick={() => setImportNotification(null)}
            className="text-slate-400 hover:text-slate-200 text-xs font-bold px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Filter and Action Bar */}
      <div className={`border rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0 shadow-sm ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl py-2 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                isRtl ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'
              } ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className={`rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 border ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="ALL">{t.allDomains} ({framework.domains?.length || 0})</option>
            {(framework.domains || []).map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 border ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="ALL">{t.allStatuses}</option>
            <option value="COMPLIANT">{t.compliant}</option>
            <option value="PARTIALLY_COMPLIANT">{t.partiallyCompliant}</option>
            <option value="NON_COMPLIANT">{t.nonCompliant}</option>
            <option value="NOT_APPLICABLE">{t.notApplicable}</option>
            <option value="NOT_ASSESSED">{t.notAssessed}</option>
          </select>
        </div>

        {/* Client Questionnaire Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Download Questionnaire Button */}
          <button
            onClick={handleDownloadQuestionnaire}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
            }`}
            title="Download Excel questionnaire to send to client"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t.downloadQuestionnaire}</span>
          </button>

          {/* Upload Questionnaire Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            title="Upload filled client responses Excel to auto-fill tracker"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-100" />
            <span>{t.uploadQuestionnaire}</span>
          </button>

          <div className="text-xs font-bold text-slate-400 pl-2 border-l border-slate-700/40">
            {t.showingControls} <span className="text-emerald-500 font-extrabold">{filteredControls.length}</span> / {framework.controls?.length || 0}
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left Column: Control List (Scrollable) */}
        <div className={`col-span-5 border rounded-2xl flex flex-col overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`p-3.5 border-b text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
            theme === 'dark' ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-700'
          }`}>
            <span>{t.controlsChecklist}</span>
            <span className="text-emerald-500 font-extrabold">{filteredControls.length} {isRtl ? 'ضابط' : 'controls'}</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1.5">
            {filteredControls.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {isRtl ? 'لم يتم العثور على ضوابط مطابقة للبحث' : 'No matching controls found'}
              </div>
            ) : (
              filteredControls.map((ctrl) => {
                const isSelected = ctrl.id === activeControl.id;
                const record = assessments.find(a => a.controlId === ctrl.id);
                const status = record?.status || 'NOT_ASSESSED';

                return (
                  <div
                    key={ctrl.id}
                    onClick={() => handleSelectControl(ctrl)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition flex flex-col gap-1.5 border ${
                      isSelected 
                        ? theme === 'dark'
                          ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500/50' 
                          : 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                        : theme === 'dark' 
                          ? 'bg-slate-900/40 hover:bg-slate-900 border-slate-800/80 text-slate-300' 
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-500">{ctrl.id}</span>
                      {getStatusBadge(status)}
                    </div>
                    <div className="text-xs font-bold line-clamp-1">{ctrl.title}</div>
                    <div className={`text-[11px] line-clamp-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {ctrl.description}
                    </div>
                    
                    <div className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                      theme === 'dark' ? 'border-slate-800/40 text-slate-500' : 'border-slate-100 text-slate-400'
                    }`}>
                      <span>{ctrl.domainName.split(' ')[0]}</span>
                      <span>CMMI: {record?.cmmiLevel ?? 0}/5</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Control Assessment Form */}
        <div className={`col-span-7 border rounded-2xl flex flex-col overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Active Control Header */}
          <div className={`p-4 border-b flex items-start justify-between gap-4 ${
            theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-lg text-xs font-black">
                  {activeControl.id}
                </span>
                <span className="text-xs font-bold text-slate-400">{activeControl.domainName}</span>
                {activeControl.subDomain && (
                  <span className="text-xs text-slate-500">/ {activeControl.subDomain}</span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-extrabold">{activeControl.title}</h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {showSavedNotification && (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {t.saved}
                </span>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition"
              >
                <Save className="w-3.5 h-3.5" /> {t.saveEvaluation}
              </button>
            </div>
          </div>

          {/* Form Content Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Control Requirement Description */}
            <div className={`p-4 rounded-2xl border ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1.5">
                {t.requirementClause}
              </h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {activeControl.description}
              </p>

              {activeControl.implementationGuidance && (
                <div className="mt-3 pt-3 border-t border-slate-800/60">
                  <h4 className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-1">
                    {t.implementationGuidance}
                  </h4>
                  <p className={`text-xs whitespace-pre-line leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {activeControl.implementationGuidance}
                  </p>
                </div>
              )}

              {/* Dedicated Recommended & Required Evidence Box */}
              {activeControl.requiredEvidence && activeControl.requiredEvidence.length > 0 && (
                <div className={`mt-4 pt-3.5 border-t ${
                  theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                      <FileCheck className="w-3 h-3" />
                    </div>
                    <h4 className="text-xs font-black text-emerald-500 uppercase tracking-wider">
                      {t.recommendedEvidence}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {activeControl.requiredEvidence.map((evItem, idx) => (
                      <div 
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition ${
                          theme === 'dark' 
                            ? 'bg-slate-900/70 border-slate-800/90 text-slate-200 hover:border-emerald-500/40' 
                            : 'bg-emerald-50/60 border-emerald-200/70 text-slate-800 hover:border-emerald-400'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">
                          {idx + 1}
                        </div>
                        <span className="text-xs font-semibold leading-relaxed">
                          {evItem}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3-Tier Multi-Scoring Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Scoring Model 1: Standard Compliance Status */}
              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  {t.tieredStatus}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE'] as ComplianceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormState({
                        ...formState, 
                        status: st, 
                        scorePercent: st === 'COMPLIANT' ? 100 : st === 'PARTIALLY_COMPLIANT' ? 50 : 0,
                        cmmiLevel: st === 'COMPLIANT' ? 4 : st === 'PARTIALLY_COMPLIANT' ? 2 : (formState.cmmiLevel || 0)
                      })}
                      className={`p-2 rounded-xl text-[11px] font-bold transition text-center ${
                        formState.status === st
                          ? st === 'COMPLIANT' ? 'bg-emerald-600 text-white shadow' :
                            st === 'PARTIALLY_COMPLIANT' ? 'bg-amber-600 text-white shadow' :
                            st === 'NON_COMPLIANT' ? 'bg-rose-600 text-white shadow' :
                            'bg-slate-600 text-white shadow'
                          : theme === 'dark' ? 'bg-slate-900 hover:bg-slate-800 text-slate-400' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {st === 'COMPLIANT' ? t.compliant :
                       st === 'PARTIALLY_COMPLIANT' ? t.partiallyCompliant :
                       st === 'NON_COMPLIANT' ? t.nonCompliant : t.notApplicable}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scoring Model 2: CMMI Maturity Level (0 to 5) */}
              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> {t.cmmiMaturity}
                  </label>
                  <span className="text-xs font-black">Level {formState.cmmiLevel}</span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {[0, 1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormState({ ...formState, cmmiLevel: lvl as CMMILevel })}
                      className={`py-1.5 rounded-lg text-xs font-bold transition ${
                        formState.cmmiLevel === lvl
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : theme === 'dark' ? 'bg-slate-900 text-slate-400 hover:bg-slate-800' : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  {formState.cmmiLevel === 0 && (isRtl ? '0: غير موجود / غير مكتمل' : '0: Incomplete')}
                  {formState.cmmiLevel === 1 && (isRtl ? '1: مبدئي / غير منتظم' : '1: Initial / Ad-hoc')}
                  {formState.cmmiLevel === 2 && (isRtl ? '2: مدار على مستوى المشروع' : '2: Managed')}
                  {formState.cmmiLevel === 3 && (isRtl ? '3: محدد ومؤسسي' : '3: Defined')}
                  {formState.cmmiLevel === 4 && (isRtl ? '4: مقاس كمياً وموثوق' : '4: Quantitatively Managed')}
                  {formState.cmmiLevel === 5 && (isRtl ? '5: تحسين مستمر' : '5: Optimizing')}
                </p>
              </div>

              {/* Scoring Model 3: Percentage Score */}
              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                    {t.customScore}
                  </label>
                  <span className="text-xs font-black">{formState.scorePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formState.scorePercent}
                  onChange={(e) => setFormState({ ...formState, scorePercent: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Gap Analysis & Findings */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  {t.findingsAnalysis}
                </label>
                <textarea
                  rows={3}
                  value={formState.finding || ''}
                  onChange={(e) => setFormState({ ...formState, finding: e.target.value })}
                  placeholder="Detail any identified gaps, deficiencies, or audit findings..."
                  className={`w-full rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  {t.auditorNotes}
                </label>
                <textarea
                  rows={2}
                  value={formState.auditorNotes || ''}
                  onChange={(e) => setFormState({ ...formState, auditorNotes: e.target.value })}
                  placeholder="Confidential notes, sampled systems..."
                  className={`w-full rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Remediation Action Plan */}
            <div className={`p-4 rounded-2xl border space-y-4 ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {t.remediationRoadmap}
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  {t.remediationActionPlan}
                </label>
                <textarea
                  rows={2}
                  value={formState.remediationPlan || ''}
                  onChange={(e) => setFormState({ ...formState, remediationPlan: e.target.value })}
                  placeholder="Steps required to close this compliance gap..."
                  className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:border-rose-500 transition border ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.actionPriority}</label>
                  <select
                    value={formState.actionPriority || 'MEDIUM'}
                    onChange={(e) => setFormState({ ...formState, actionPriority: e.target.value as Priority })}
                    className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-emerald-500 border ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="CRITICAL">{t.criticalPriority}</option>
                    <option value="HIGH">{t.highPriority}</option>
                    <option value="MEDIUM">{t.mediumPriority}</option>
                    <option value="LOW">{t.lowPriority}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.assigneeOwner}</label>
                  <input
                    type="text"
                    value={formState.assignedTo || ''}
                    onChange={(e) => setFormState({ ...formState, assignedTo: e.target.value })}
                    className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 border ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.targetDueDate}</label>
                  <input
                    type="date"
                    value={formState.dueDate || ''}
                    onChange={(e) => setFormState({ ...formState, dueDate: e.target.value })}
                    className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 border ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="remediatedCheck"
                    checked={formState.isRemediated || false}
                    onChange={(e) => setFormState({ ...formState, isRemediated: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <label htmlFor="remediatedCheck" className="text-xs font-bold text-emerald-500 cursor-pointer">
                    {t.gapRemediated}
                  </label>
                </div>
              </div>
            </div>

            {/* Evidence & Artifact Vault */}
            <div className={`p-4 rounded-2xl border ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-500" /> {t.attachedEvidence} ({attachedEvidence.length})
                </h3>
                <button
                  type="button"
                  onClick={() => onAttachEvidenceModal(activeControl.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition border ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800' : 'bg-white border-slate-300 text-emerald-600 hover:bg-slate-100'
                  }`}
                >
                  <Paperclip className="w-3 h-3" /> {t.attachEvidenceBtn}
                </button>
              </div>

              {attachedEvidence.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  {isRtl ? 'لا توجد أدلة مرفقة بعد.' : 'No evidence attached yet.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {attachedEvidence.map(ev => (
                    <div key={ev.id} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="truncate pr-2">
                        <div className="text-xs font-bold truncate">{ev.title}</div>
                        <div className="text-[10px] text-slate-400">{ev.type} • {ev.fileName || ev.externalUrl}</div>
                      </div>
                      {ev.externalUrl && (
                        <a 
                          href={ev.externalUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-emerald-500 hover:text-emerald-400 p-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
