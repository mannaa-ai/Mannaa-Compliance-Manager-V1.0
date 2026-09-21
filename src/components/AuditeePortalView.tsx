import React, { useState } from 'react';
import type { Framework, ControlItem, AssessmentRecord, EvidenceItem } from '../types';
import type { Language } from '../utils/i18n';
import { 
  Building2, 
  Users, 
  Clock, 
  AlertCircle, 
  Paperclip, 
  Search, 
  Send, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';

interface AuditeePortalViewProps {
  framework: Framework;
  assessments: AssessmentRecord[];
  evidenceList: EvidenceItem[];
  onSaveAssessment: (record: AssessmentRecord) => void;
  onBatchSaveAssessments?: (records: AssessmentRecord[]) => void;
  onAttachEvidenceModal: (controlId: string) => void;
  lang?: Language;
  theme?: 'dark' | 'light';
  projectId?: string;
}

const DEPARTMENTS = [
  'All Departments',
  'IT Infrastructure & Networks',
  'Cybersecurity & SOC Operations',
  'HR & People Operations',
  'Legal & Regulatory Compliance',
  'Procurement & Vendor Management',
  'Physical Security & Facility',
  'Application Development & DevOps',
  'Business Continuity & Risk Management'
];

export const AuditeePortalView: React.FC<AuditeePortalViewProps> = ({
  framework,
  assessments,
  evidenceList,
  onSaveAssessment,
  onBatchSaveAssessments,
  onAttachEvidenceModal,
  lang = 'ar',
  theme = 'dark',
  projectId = 'default'
}) => {
  const isRtl = lang === 'ar';

  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'APPROVED'>('ALL');

  // Active Control Selection
  const [activeControlId, setActiveControlId] = useState<string>(framework.controls[0]?.id || '');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [batchAssignModal, setBatchAssignModal] = useState(false);
  const [targetBatchDept, setTargetBatchDept] = useState(DEPARTMENTS[1]);
  const [selectedBatchControls, setSelectedBatchControls] = useState<string[]>([]);

  // Assessment map lookup
  const assessmentMap = new Map<string, AssessmentRecord>();
  assessments.forEach(a => assessmentMap.set(a.controlId, a));

  // Current active control object
  const activeControl: ControlItem | undefined = framework.controls.find(c => c.id === activeControlId) || framework.controls[0];
  const activeRecord = activeControl ? assessmentMap.get(activeControl.id) : undefined;

  // Local state for auditee response
  const [auditeeResponseText, setAuditeeResponseText] = useState<string>(activeRecord?.remediationPlan || '');

  // Update response text when active control changes
  React.useEffect(() => {
    if (activeControl) {
      const rec = assessmentMap.get(activeControl.id);
      setAuditeeResponseText(rec?.remediationPlan || '');
    }
  }, [activeControlId]);

  // Filtering Controls by Department and Search
  const filteredControls = (framework.controls || []).filter(ctrl => {
    const rec = assessmentMap.get(ctrl.id);
    const assigned = rec?.assignedTo || 'Unassigned';

    // Department match
    const matchesDept = selectedDept === 'All Departments' || 
      (selectedDept === 'Unassigned' && (!rec?.assignedTo || rec.assignedTo === '')) ||
      assigned.toLowerCase().includes(selectedDept.toLowerCase());

    // Search match
    const matchesSearch = searchQuery === '' ||
      ctrl.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ctrl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ctrl.description && ctrl.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    let matchesStatus = true;
    const hasEvidence = (rec?.evidenceIds?.length || 0) > 0;
    const isSubmitted = !!rec?.remediationPlan && rec.remediationPlan.trim().length > 0;
    const isApproved = rec?.status === 'COMPLIANT';

    if (statusFilter === 'APPROVED') matchesStatus = isApproved;
    else if (statusFilter === 'SUBMITTED') matchesStatus = isSubmitted && !isApproved;
    else if (statusFilter === 'PENDING') matchesStatus = !hasEvidence && !isSubmitted && !isApproved;

    return matchesDept && matchesSearch && matchesStatus;
  });

  // Calculate Departmental Stats
  const totalInScope = filteredControls.length;
  const withEvidenceCount = filteredControls.filter(ctrl => (assessmentMap.get(ctrl.id)?.evidenceIds?.length || 0) > 0).length;
  const withResponsesCount = filteredControls.filter(ctrl => !!assessmentMap.get(ctrl.id)?.remediationPlan?.trim()).length;
  const approvedCount = filteredControls.filter(ctrl => assessmentMap.get(ctrl.id)?.status === 'COMPLIANT').length;
  const completionPercentage = totalInScope > 0 ? Math.round(((withEvidenceCount + withResponsesCount) / (totalInScope * 2)) * 100) : 0;

  // Due Date calculation
  const getDueDateBadge = (dueDate?: string) => {
    if (!dueDate) {
      return (
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {isRtl ? 'لا يوجد موعد محدد' : 'No Due Date'}
        </span>
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {isRtl ? `متأخر (${Math.abs(diffDays)} يوم)` : `Overdue (${Math.abs(diffDays)}d)`}
        </span>
      );
    } else if (diffDays <= 7) {
      return (
        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Clock className="w-3 h-3" /> {isRtl ? `متبقي ${diffDays} أيام` : `Due in ${diffDays}d`}
        </span>
      );
    } else {
      return (
        <span className="text-[10px] font-medium text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Calendar className="w-3 h-3 text-emerald-400" /> {dueDate}
        </span>
      );
    }
  };

  // Submit auditee response
  const handleSaveAuditeeResponse = () => {
    if (!activeControl) return;
    const existing = assessmentMap.get(activeControl.id) || {
      id: `assess-${activeControl.id}`,
      projectId,
      controlId: activeControl.id,
      frameworkId: framework.id,
      status: 'PARTIALLY_COMPLIANT',
      cmmiLevel: 2,
      scorePercent: 50,
      evidenceIds: [],
      lastUpdated: new Date().toISOString()
    };

    const updated: AssessmentRecord = {
      ...existing,
      remediationPlan: auditeeResponseText,
      assignedTo: existing.assignedTo || (selectedDept !== 'All Departments' ? selectedDept : 'Department Representative'),
      lastUpdated: new Date().toISOString()
    };

    onSaveAssessment(updated);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  // Batch Assign Controls to Department
  const handleExecuteBatchAssign = () => {
    if (selectedBatchControls.length === 0) {
      alert(isRtl ? 'الرجاء اختيار ضابط واحد على الأقل' : 'Please select at least one control');
      return;
    }

    const updatedList: AssessmentRecord[] = [];
    selectedBatchControls.forEach(ctrlId => {
      const existing = assessmentMap.get(ctrlId) || {
        id: `assess-${ctrlId}`,
        projectId,
        controlId: ctrlId,
        frameworkId: framework.id,
        status: 'NOT_ASSESSED',
        cmmiLevel: 0,
        scorePercent: 0,
        evidenceIds: [],
        lastUpdated: new Date().toISOString()
      };

      updatedList.push({
        ...existing,
        assignedTo: targetBatchDept,
        lastUpdated: new Date().toISOString()
      });
    });

    if (onBatchSaveAssessments) {
      onBatchSaveAssessments(updatedList);
    } else {
      updatedList.forEach(rec => onSaveAssessment(rec));
    }

    setSelectedBatchControls([]);
    setBatchAssignModal(false);
  };

  const attachedEvidence = activeRecord ? evidenceList.filter(e => activeRecord.evidenceIds?.includes(e.id)) : [];

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`h-[calc(100vh-2rem)] flex flex-col overflow-hidden p-4 font-['Cairo'] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#060b13] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Banner & Department Switcher */}
      <div className={`border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 mb-3 shrink-0 shadow-sm ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>{isRtl ? 'بوابة الجهة المفوضة وإدارة الأقسام (Auditee Portal)' : 'Auditee Self-Service & Departmental Portal'}</span>
          </div>
          <h1 className="text-lg font-extrabold text-slate-100">
            {isRtl ? 'مساحة عمل مدراء الإدارات وممثلي الأقسام' : 'Departmental Custodians & Evidence Submission Desk'}
          </h1>
        </div>

        {/* Quick Department Filter Dropdown */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={`rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 border ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
              <option value="Unassigned">{isRtl ? 'غير معين لأي قسم (Unassigned)' : 'Unassigned Controls'}</option>
            </select>
          </div>

          {/* Batch Delegation Button */}
          <button
            onClick={() => setBatchAssignModal(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/40 transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تفويض جماعي للأقسام' : 'Batch Delegate'}</span>
          </button>
        </div>
      </div>

      {/* Department Progress KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 shrink-0">
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="text-[11px] text-slate-400 font-bold">{isRtl ? 'الضوابط المكلف بها' : 'Assigned Controls'}</div>
            <div className="text-xl font-extrabold text-slate-100 mt-0.5">{totalInScope}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
            {framework.code}
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="text-[11px] text-slate-400 font-bold">{isRtl ? 'الشواهد المرفوعة' : 'Evidence Uploaded'}</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{withEvidenceCount} / {totalInScope}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Paperclip className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="text-[11px] text-slate-400 font-bold">{isRtl ? 'إجابات وملاحظات القسم' : 'Responses Submitted'}</div>
            <div className="text-xl font-extrabold text-amber-400 mt-0.5">{withResponsesCount} / {totalInScope}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex-1 pr-2">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span className="text-slate-400">{isRtl ? 'نسبة جاهزية القسم' : 'Readiness Rate'}</span>
              <span className="text-emerald-400">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left Column: Assigned Controls Checklist */}
        <div className={`col-span-5 border rounded-2xl flex flex-col overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`p-3 border-b flex items-center justify-between gap-2 ${
            theme === 'dark' ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'
          }`}>
            <div className="relative flex-1">
              <Search className={`w-3.5 h-3.5 absolute ${isRtl ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
              <input
                type="text"
                placeholder={isRtl ? 'بحث في ضوابط القسم...' : 'Search assigned controls...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-xl py-1.5 text-xs focus:outline-none focus:border-emerald-500 border ${
                  isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
                } ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`rounded-xl px-2 py-1.5 text-[11px] font-bold border ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="ALL">{isRtl ? 'الكل' : 'All'}</option>
              <option value="PENDING">{isRtl ? 'بانتظار الإجراء' : 'Pending Action'}</option>
              <option value="SUBMITTED">{isRtl ? 'تم الرد' : 'Submitted'}</option>
              <option value="APPROVED">{isRtl ? 'معتمد' : 'Approved'}</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1.5">
            {filteredControls.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {isRtl ? 'لا توجد ضوابط مخصصة لهذا القسم حالياً.' : 'No controls assigned to this department.'}
              </div>
            ) : (
              filteredControls.map((ctrl) => {
                const isSelected = ctrl.id === activeControlId;
                const rec = assessmentMap.get(ctrl.id);
                const hasEvidence = (rec?.evidenceIds?.length || 0) > 0;
                const hasResponse = !!rec?.remediationPlan?.trim();

                return (
                  <div
                    key={ctrl.id}
                    onClick={() => setActiveControlId(ctrl.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition flex flex-col gap-1.5 border ${
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
                      <span className="text-xs font-extrabold text-emerald-400">{ctrl.id}</span>
                      {getDueDateBadge(rec?.dueDate)}
                    </div>
                    <div className="text-xs font-bold line-clamp-1">{ctrl.title}</div>
                    
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px]">
                      <span className="text-slate-400 truncate max-w-[140px]">{rec?.assignedTo || selectedDept}</span>
                      <div className="flex items-center gap-2">
                        {hasResponse && (
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <Send className="w-3 h-3" /> {isRtl ? 'تم الرد' : 'Replied'}
                          </span>
                        )}
                        {hasEvidence ? (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <Paperclip className="w-3 h-3" /> {rec?.evidenceIds.length} {isRtl ? 'شواهد' : 'docs'}
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" /> {isRtl ? 'دليل مطلوب' : 'Evidence Req'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Auditee Operational Response & Direct Upload Desk */}
        <div className={`col-span-7 border rounded-2xl flex flex-col overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {activeControl ? (
            <>
              {/* Header */}
              <div className={`p-4 border-b flex items-start justify-between gap-4 ${
                theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-black">
                      {activeControl.id}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{activeControl.domainName}</span>
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-100">{activeControl.title}</h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {showSavedFeedback && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {isRtl ? 'تم تسليم الرد بنجاح' : 'Response Submitted'}
                    </span>
                  )}
                  <button
                    onClick={handleSaveAuditeeResponse}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تسليم الرد للمدقق' : 'Submit to Auditor'}</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Control Requirement */}
                <div className={`p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                    {isRtl ? 'نص المتطلب والضابط التنظيمي' : 'Regulatory Requirement Clause'}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {activeControl.description}
                  </p>

                  {/* Recommended Evidence Box */}
                  {activeControl.requiredEvidence && activeControl.requiredEvidence.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 mb-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          {isRtl ? 'الأدلة والوثائق المطلوبة من قسمك' : 'Required Documentation from your Department'}
                        </h4>
                      </div>
                      <div className="space-y-1.5">
                        {activeControl.requiredEvidence.map((ev, i) => (
                          <div key={i} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Auditee Implementation Response Box */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'إفادة القسم وإجراءات التطبيق التشغيلية' : 'Departmental Implementation Statement & Operational Response'}</span>
                    </h3>
                    <span className="text-[10px] text-slate-400">{isRtl ? 'مرئي لفريق التدقيق' : 'Visible to Audit Team'}</span>
                  </div>

                  <textarea
                    rows={4}
                    value={auditeeResponseText}
                    onChange={(e) => setAuditeeResponseText(e.target.value)}
                    placeholder={isRtl ? 'اشرح كيف يلتزم قسمك بهذا المتطلب، والسياسات المتبعة، أو خطة معالجة الفجوة إن وجدت...' : 'Explain how your department fulfills this requirement, current policies in place, or remediation steps...'}
                    className={`w-full rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition border ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {/* Evidence Artifacts Upload Section */}
                <div className={`p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'شواهد ووثائق القسم المرفقة' : 'Attached Departmental Evidence Artifacts'} ({attachedEvidence.length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => onAttachEvidenceModal(activeControl.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{isRtl ? 'رفع وإرفاق دليل جديد' : 'Upload / Attach Evidence'}</span>
                    </button>
                  </div>

                  {attachedEvidence.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
                      <p>{isRtl ? 'لم يتم إرفاق وثائق أو شواهد بعد.' : 'No evidence attached yet for this control.'}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {isRtl ? 'انقر على "رفع وإرفاق دليل جديد" لرفع سياسات، صور شاشات، أو روابط المستودع.' : 'Click "Upload / Attach Evidence" to upload departmental policies, screenshots, or system logs.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {attachedEvidence.map(ev => (
                        <div key={ev.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div className="truncate pr-2">
                            <div className="text-xs font-bold text-slate-200 truncate">{ev.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{ev.type} • {ev.fileName || ev.externalUrl}</div>
                          </div>
                          {ev.externalUrl && (
                            <a 
                              href={ev.externalUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 p-1"
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
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              {isRtl ? 'اختر ضابطاً من القائمة الجانبية لعرض التفاصيل' : 'Select a control from the list to view requirements and submit responses.'}
            </div>
          )}
        </div>
      </div>

      {/* Batch Delegation Modal */}
      {batchAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-xl w-full rounded-2xl border p-6 shadow-2xl ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-base font-bold mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>{isRtl ? 'تفويض مجموعة ضوابط لقسم معين' : 'Batch Assign Controls to Department'}</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {isRtl ? 'اختر القسم المستهدف ثم حدد الضوابط التي ترغب في تكليفهم بها دفعة واحدة.' : 'Select target department and choose controls to delegate simultaneously.'}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{isRtl ? 'القسم المستهدف' : 'Target Department'}</label>
              <select
                value={targetBatchDept}
                onChange={(e) => setTargetBatchDept(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                {DEPARTMENTS.filter(d => d !== 'All Departments').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="mb-4 max-h-60 overflow-y-auto border border-slate-800 rounded-xl p-2 space-y-1.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-400 px-1">
                <span>{framework.controls.length} {isRtl ? 'ضابط متاح' : 'Available Controls'}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedBatchControls.length === framework.controls.length) {
                      setSelectedBatchControls([]);
                    } else {
                      setSelectedBatchControls(framework.controls.map(c => c.id));
                    }
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  {selectedBatchControls.length === framework.controls.length ? (isRtl ? 'إلغاء تحديد الكل' : 'Deselect All') : (isRtl ? 'تحديد الكل' : 'Select All')}
                </button>
              </div>

              {framework.controls.map(ctrl => {
                const isChecked = selectedBatchControls.includes(ctrl.id);
                return (
                  <label key={ctrl.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/40 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBatchControls([...selectedBatchControls, ctrl.id]);
                        } else {
                          setSelectedBatchControls(selectedBatchControls.filter(id => id !== ctrl.id));
                        }
                      }}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                    />
                    <span className="font-bold text-emerald-400 shrink-0">{ctrl.id}</span>
                    <span className="truncate text-slate-300">{ctrl.title}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setBatchAssignModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchAssign}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isRtl ? `تعيين (${selectedBatchControls.length}) ضابط` : `Assign (${selectedBatchControls.length}) Controls`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
