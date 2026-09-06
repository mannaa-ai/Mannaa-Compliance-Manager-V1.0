export type Language = 'en' | 'ar';

export interface Translations {
  appName: string;
  brandSub: string;
  loginTitle: string;
  loginSub: string;
  auditorName: string;
  professionalRole: string;
  email: string;
  password: string;
  signInBtn: string;
  signOutBtn: string;
  encryptedVault: string;
  offlineReady: string;
  
  // Landing Page
  projectsHub: string;
  projectsHubSub: string;
  createNewProject: string;
  activeWorkspaces: string;
  openWorkspace: string;
  noProjectsFound: string;
  noProjectsFoundSub: string;
  clientOrgName: string;
  projectAuditName: string;
  leadAuditor: string;
  targetStandards: string;
  selectMultiple: string;
  projectScope: string;
  cancel: string;
  createAndStart: string;
  importCustomStandard: string;
  
  // Sidebar & Navigation
  auditWorkspace: string;
  complianceAnalytics: string;
  controlsAssessment: string;
  evidenceVault: string;
  crossFrameworkMappings: string;
  reportsDeliverables: string;
  projectStandards: string;
  importBtn: string;
  downloadTemplate: string;
  backToProjects: string;
  
  // Assessment & Questionnaire
  searchPlaceholder: string;
  allDomains: string;
  allStatuses: string;
  showingControls: string;
  controlsChecklist: string;
  requirementClause: string;
  implementationGuidance: string;
  recommendedEvidence: string;
  crossReferences: string;
  tieredStatus: string;
  cmmiMaturity: string;
  customScore: string;
  findingsAnalysis: string;
  auditorNotes: string;
  remediationRoadmap: string;
  remediationActionPlan: string;
  actionPriority: string;
  assigneeOwner: string;
  targetDueDate: string;
  gapRemediated: string;
  attachedEvidence: string;
  attachEvidenceBtn: string;
  saveEvaluation: string;
  saved: string;
  downloadQuestionnaire: string;
  uploadQuestionnaire: string;
  questionnaireImportSuccess: string;
  questionnaireDesc: string;
  
  // Statuses
  compliant: string;
  partiallyCompliant: string;
  nonCompliant: string;
  notApplicable: string;
  notAssessed: string;
  
  // Priorities
  criticalPriority: string;
  highPriority: string;
  mediumPriority: string;
  lowPriority: string;
  
  // Deliverables
  executivePdf: string;
  executivePdfSub: string;
  excelMatrix: string;
  excelMatrixSub: string;
  statementOfApplicability: string;
  statementOfApplicabilitySub: string;
  exportPdfBtn: string;
  exportExcelBtn: string;
  exportSoaBtn: string;
  
  // Theme & Lang
  darkTheme: string;
  lightTheme: string;
  switchLang: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'COMPLIANCE MANAGER',
    brandSub: 'anmat.sa • Saudi GRC & Audit Suite',
    loginTitle: 'ANMAT COMPLIANCE MANAGER',
    loginSub: 'Enterprise GRC, Audit & Regulatory Suite',
    auditorName: 'Auditor / Assessor Name',
    professionalRole: 'Professional Role / Department',
    email: 'Email Address',
    password: 'Password',
    signInBtn: 'Sign In to Audit Center',
    signOutBtn: 'Sign Out',
    encryptedVault: 'Encrypted Local Vault',
    offlineReady: 'Offline Windows Desktop Ready',
    
    projectsHub: 'Audit Projects & Workspaces',
    projectsHubSub: 'Create and manage compliance assessments with full NCA, SAMA, ISO, and NIST regulatory standards.',
    createNewProject: 'Create New Audit Project',
    activeWorkspaces: 'Active Audit Workspaces',
    openWorkspace: 'Open Audit Workspace',
    noProjectsFound: 'No Projects Found',
    noProjectsFoundSub: 'Click Create New Audit Project above to get started.',
    clientOrgName: 'Client / Organization Name',
    projectAuditName: 'Project Audit Name',
    leadAuditor: 'Lead Auditor / Team',
    targetStandards: 'Select Target Standards & Frameworks',
    selectMultiple: 'You can select multiple',
    projectScope: 'Project Scope / Audit Notes',
    cancel: 'Cancel',
    createAndStart: 'Create Project & Start Assessment',
    importCustomStandard: 'Import Custom Standard',
    
    auditWorkspace: 'Audit Workspace',
    complianceAnalytics: 'Compliance Analytics',
    controlsAssessment: 'Controls Assessment',
    evidenceVault: 'Evidence Vault',
    crossFrameworkMappings: 'Cross-Framework Mappings',
    reportsDeliverables: 'Reports & Deliverables',
    projectStandards: 'Project Standards',
    importBtn: 'Import',
    downloadTemplate: 'Template',
    backToProjects: 'Back to Projects',
    
    searchPlaceholder: 'Search by Control ID, title, keyword...',
    allDomains: 'All Domains',
    allStatuses: 'All Statuses',
    showingControls: 'Showing',
    controlsChecklist: 'Controls Checklist',
    requirementClause: 'Requirement / Standard Clause',
    implementationGuidance: 'Implementation Guidance & Objectives',
    recommendedEvidence: 'Recommended & Required Evidence Documents',
    crossReferences: 'Cross Framework References',
    tieredStatus: '1. Tiered Status',
    cmmiMaturity: '2. CMMI Maturity (0-5)',
    customScore: '3. Custom Score %',
    findingsAnalysis: 'Audit Findings & Deficiency Analysis',
    auditorNotes: 'Auditor Field Notes & Comments',
    remediationRoadmap: 'Corrective Action & Remediation Roadmap',
    remediationActionPlan: 'Remediation Action Plan',
    actionPriority: 'Action Priority',
    assigneeOwner: 'Assignee / Owner',
    targetDueDate: 'Target Due Date',
    gapRemediated: 'Gap Remediated',
    attachedEvidence: 'Attached Evidence',
    attachEvidenceBtn: 'Attach Evidence',
    saveEvaluation: 'Save Evaluation',
    saved: 'Saved',
    downloadQuestionnaire: 'Download Questionnaire',
    uploadQuestionnaire: 'Upload Questionnaire',
    questionnaireImportSuccess: 'Questionnaire responses imported into tracker successfully!',
    questionnaireDesc: 'Export Excel questionnaire to send to client, or upload completed responses.',
    
    compliant: 'Compliant',
    partiallyCompliant: 'Partially Compliant',
    nonCompliant: 'Non-Compliant',
    notApplicable: 'Not Applicable',
    notAssessed: 'Not Assessed',
    
    criticalPriority: 'Critical (Fix in 7 days)',
    highPriority: 'High (Fix in 30 days)',
    mediumPriority: 'Medium (Fix in 90 days)',
    lowPriority: 'Low (Fix in 180 days)',
    
    executivePdf: 'Executive Summary PDF',
    executivePdfSub: 'Boardroom-ready formal deliverable containing executive scorecards, domain compliance table, and critical findings list.',
    excelMatrix: 'Comprehensive Excel Audit Matrix',
    excelMatrixSub: 'Full multi-tab spreadsheet with all controls, scoring models, auditor findings, remediation tasks, and cross-framework tags.',
    statementOfApplicability: 'Statement of Applicability (SoA)',
    statementOfApplicabilitySub: 'Mandatory ISO 27001 / NCA deliverable documenting inclusion and justification for every control.',
    exportPdfBtn: 'Export Executive PDF',
    exportExcelBtn: 'Export Excel Gap Matrix',
    exportSoaBtn: 'Export SoA Sheet',
    
    darkTheme: 'Dark Mode',
    lightTheme: 'Light Mode',
    switchLang: 'العربية'
  },
  ar: {
    appName: 'مدير الامتثال والتدقيق',
    brandSub: 'أنماط للتكنولوجيا • منصة الحوكمة والمخاطر والالتزام',
    loginTitle: 'أنماط - نظام إدارة الامتثال والتدقيق',
    loginSub: 'المنصة الشاملة لإدارة الامتثال للأمن السيبراني والمعايير الدولية',
    auditorName: 'اسم المدقق / المقيّم',
    professionalRole: 'المسمى الوظيفي / الإدارة',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signInBtn: 'تسجيل الدخول إلى منصة التدقيق',
    signOutBtn: 'تسجيل الخروج',
    encryptedVault: 'مستودع أدلة مشفر ومحلي',
    offlineReady: 'جاهز للتطبيق المكتبي ونظام ويندوز',
    
    projectsHub: 'مشاريع ومساحات عمل التدقيق',
    projectsHubSub: 'إنشاء وإدارة تقييمات الامتثال المعتمدة لمعايير الهيئة الوطنية للأمن السيبراني، البنك المركزي السعودي، ومواصفات الآيزو.',
    createNewProject: 'إنشاء مشروع تدقيق جديد',
    activeWorkspaces: 'مساحات عمل التدقيق النشطة',
    openWorkspace: 'فتح مساحة عمل التدقيق',
    noProjectsFound: 'لا توجد مشاريع سابقة',
    noProjectsFoundSub: 'انقر فوق زر إنشاء مشروع تدقيق جديد للبدء.',
    clientOrgName: 'اسم الجهة / العميل',
    projectAuditName: 'اسم مشروع التدقيق والتقييم',
    leadAuditor: 'كبير المدققين / فريق العمل',
    targetStandards: 'حدد المعايير والضوابط المطبقة على المشروع',
    selectMultiple: 'يمكنك اختيار أكثر من معيار',
    projectScope: 'نطاق المشروع / ملاحظات التدقيق',
    cancel: 'إلغاء',
    createAndStart: 'إنشاء المشروع والبدء في التقييم',
    importCustomStandard: 'استيراد معيار مخصص',
    
    auditWorkspace: 'مساحة التدقيق',
    complianceAnalytics: 'تحليلات ونسب الامتثال',
    controlsAssessment: 'تقييم ومراجعة الضوابط',
    evidenceVault: 'مستودع الأدلة والوثائق',
    crossFrameworkMappings: 'المواءمة بين المعايير',
    reportsDeliverables: 'التقارير والمخرجات الرسمية',
    projectStandards: 'معايير المشروع',
    importBtn: 'استيراد',
    downloadTemplate: 'نموذج إكسل',
    backToProjects: 'العودة للمشاريع',
    
    searchPlaceholder: 'ابحث برقم الضابط، العنوان، أو الكلمة المفتاحية...',
    allDomains: 'جميع المكونات والمجالات',
    allStatuses: 'جميع حالات الالتزام',
    showingControls: 'عرض',
    controlsChecklist: 'قائمة الضوابط والمتطلبات',
    requirementClause: 'نص المتطلب / الضابط الرقابي',
    implementationGuidance: 'إرشادات التطبيق ومتطلبات الأدلة الإلزامية',
    recommendedEvidence: 'الأدلة والوثائق الإلزامية والموصى بها للتدقيق',
    crossReferences: 'المواءمة المرجعية مع المعايير الأخرى',
    tieredStatus: '١. مستوى الالتزام المرحلي',
    cmmiMaturity: '٢. مستوى النضج CMMI (0-5)',
    customScore: '٣. النسبة المئوية المخصصة %',
    findingsAnalysis: 'تحليل الفجوات وملاحظات التدقيق الميداني',
    auditorNotes: 'ملاحظات المدقق السرية والعينات',
    remediationRoadmap: 'خطة المعالجة والإجراءات التصحيحية',
    remediationActionPlan: 'خطة وإجراءات إغلاق الفجوة',
    actionPriority: 'أولوية الإجراء التصحيحي',
    assigneeOwner: 'المسؤول عن التنفيذ',
    targetDueDate: 'تاريخ الاستحقاق المستهدف',
    gapRemediated: 'تمت معالجة وإغلاق الفجوة',
    attachedEvidence: 'الأدلة والوثائق المرفقة',
    attachEvidenceBtn: 'إرفاق دليل / وثيقة',
    saveEvaluation: 'حفظ التقييم',
    saved: 'تم الحفظ بنجاح',
    downloadQuestionnaire: 'تحميل استبيان العميل (Excel)',
    uploadQuestionnaire: 'رفع إجابات الاستبيان (Excel)',
    questionnaireImportSuccess: 'تم استيراد وتحديث إجابات الاستبيان في سجل التقييم بنجاح!',
    questionnaireDesc: 'تصدير استبيان إكسل لإرساله للعميل، أو رفع الإجابات المعبأة لقراءتها وتحديث لوحة المتابعة.',
    
    compliant: 'مطبق كلياً (ملتزم)',
    partiallyCompliant: 'مطبق جزئياً',
    nonCompliant: 'غير مطبق (فجوة)',
    notApplicable: 'لا ينطبق',
    notAssessed: 'قيد التقييم',
    
    criticalPriority: 'حرج جداً (إغلاق خلال 7 أيام)',
    highPriority: 'عالي (إغلاق خلال 30 يوماً)',
    mediumPriority: 'متوسط (إغلاق خلال 90 يوماً)',
    lowPriority: 'منخفض (إغلاق خلال 180 يوماً)',
    
    executivePdf: 'تقرير الامتثال التنفيذي (PDF)',
    executivePdfSub: 'مخرج رسمي موجه للإدارة العليا يشمل بطاقات الأداء، نسب الامتثال لكل مجال، وخطة معالجة المخاطر الحرجة.',
    excelMatrix: 'مصفوفة تحليل الفجوات والتدقيق (Excel)',
    excelMatrixSub: 'جدول بيانات متكامل لجميع الضوابط ونماذج التقييم، خطط المعالجة، والمواءمة بين المعايير.',
    statementOfApplicability: 'وثيقة بيان التطبيق (SoA)',
    statementOfApplicabilitySub: 'الوثيقة الإلزامية لمواصفة الآيزو والهيئة الوطنية للأمن السيبراني لتوثيق مبررات تطبيق واستثناء الضوابط.',
    exportPdfBtn: 'تصدير التقرير التنفيذي PDF',
    exportExcelBtn: 'تصدير مصفوفة الإكسل الشاملة',
    exportSoaBtn: 'تصدير بيان التطبيق SoA',
    
    darkTheme: 'الوضع الليلي',
    lightTheme: 'الوضع النهاري',
    switchLang: 'English'
  }
};
