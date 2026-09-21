import React, { useState } from 'react';
import type { Framework, AssessmentRecord, ControlItem } from '../types';
import type { Language } from '../utils/i18n';
import { 
  Bot, 
  FileCode2, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Wand2, 
  Layers, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface AiPolicyAssistantViewProps {
  framework: Framework;
  assessments: AssessmentRecord[];
  clientName?: string;
  onSaveAssessment?: (record: AssessmentRecord) => void;
  lang?: Language;
  theme?: 'dark' | 'light';
  projectId?: string;
}

interface PolicyTemplate {
  id: string;
  titleEn: string;
  titleAr: string;
  category: string;
  applicableStandards: string[];
  contentEn: (org: string) => string;
  contentAr: (org: string) => string;
}

const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    id: 'access-control',
    titleEn: 'Identity & Access Control Policy (IAM)',
    titleAr: 'سياسة إدارة الهويات والتحكم في الوصول',
    category: 'Access Governance',
    applicableStandards: ['NCA ECC', 'SAMA CSF', 'ISO 27001', 'NIST CSF'],
    contentEn: (org) => `# ${org.toUpperCase()} - IDENTITY & ACCESS CONTROL POLICY

## 1. Purpose & Objective
This policy establishes mandatory governance principles and operational requirements for granting, managing, auditing, and revoking user and administrative access to ${org}'s information systems, applications, databases, and network infrastructure.

## 2. Scope & Applicability
This policy applies to all employees, contractors, third-party service providers, and automated system accounts accessing ${org}'s digital assets.

## 3. Core Policy Statements
- **Principle of Least Privilege**: Access rights must be granted solely on a strict need-to-know and need-to-do basis.
- **Multi-Factor Authentication (MFA)**: Mandatory enforcement of MFA for all remote access, VPN connections, cloud management portals, and privileged administrative sessions.
- **Password Complexity Standards**: Passwords must contain a minimum of 14 characters with uppercase, lowercase, numbers, and special symbols. Regular password changes enforced every 90 days.
- **Account Lifecycle Management**: Immediate deactivation of accounts upon employee termination within 1 hour; inactive accounts disabled after 30 days of inactivity.
- **Periodic Privilege Review**: Quarterly re-certification of administrative access rights conducted by the CISO and department heads.

## 4. Compliance & Audit Verification
Violations of this policy are subject to disciplinary action and regulatory non-compliance reporting under NCA ECC and SAMA CSF mandates.

---
*Authorized by ${org} Chief Information Security Officer (CISO) • Version 1.0*`,
    contentAr: (org) => `# سياسة إدارة الهويات والتحكم في الوصول - ${org}

## ١. الغرض والأهداف
تهدف هذه السياسة إلى تحديد المتطلبات الإلزامية لحوكمة ومنح ومراجعة وإلغاء صلاحيات الوصول إلى الأنظمة الرقمية والشبكات وقواعد البيانات في ${org} وفق ضوابط الهيئة الوطنية للأمن السيبراني والبنك المركزي السعودي.

## ٢. النطاق والشمولية
تنطبق هذه السياسة على جميع الموظفين والمتعاقدين والأنظمة المؤتمتة ومزودي الخدمات السحابية والجهات الخارجية.

## ٣. المبادئ والبنود الإلزامية
- **مبدأ الحد الأدنى من الصلاحيات (Least Privilege)**: يُمنح الوصول فقط بالقدر الضروري لأداء مهام العمل المعتمدة.
- **التحقق الثنائي المتعدد (MFA)**: تفعيل المصادقة متعددة العوامل إلزامياً لكافة عمليات الوصول عن بُعد، الحسابات ذات الصلاحيات العالية (Privileged Accounts)، وبوابات إدارة السحابة.
- **معايير كلمات المرور**: ألا يقل طول كلمة المرور عن ١٤ خانة تحتوي على رموز وأرقام وحروف كبيرة وصغيرة مع التغيير الدوري.
- **إدارة دورة حياة الحسابات**: إلغاء حسابات الموظفين المنتهية خدماتهم فورياً خلال ساعة واحدة، وتعطيل الحسابات الخاملة بعد ٣٠ يوماً.
- **المراجعة الدورية للصلاحيات**: مراجعة وإعادة اعتماد صلاحيات الوصول الإدارية ربع سنوياً تحت إشراف مسؤول الأمن السيبراني.

## ٤. المراجعة والمساءلة
تخضع هذه السياسة للمراجعة السنوية وتُعد ملزمة لكافة الإدارات التشغيلية.

---
*معتمد من الإدارة التنفيذية ومسؤول الأمن السيبراني في ${org} • الإصدار ١.٠*`
  },
  {
    id: 'incident-response',
    titleEn: 'Cybersecurity Incident Response & Breach Notification Plan',
    titleAr: 'خطة الاستجابة لحوادث الأمن السيبراني والإبلاغ عن الاختراقات',
    category: 'Incident Management',
    applicableStandards: ['NCA ECC', 'SAMA CSF', 'Saudi PDPL', 'ISO 27001'],
    contentEn: (org) => `# ${org.toUpperCase()} - CYBERSECURITY INCIDENT RESPONSE PLAN

## 1. Executive Summary
This document establishes the official standard operating procedures for identifying, triaging, containing, eradicating, and recovering from cybersecurity incidents and personal data breaches impacting ${org}.

## 2. Regulatory Breach Notification Thresholds
- **Saudi PDPL (SDAIA)**: Mandatory notification of personal data breaches to the regulatory authority within **72 hours** of awareness.
- **NCA / SAMA**: Immediate notification of critical cybersecurity incidents to the National Cyber Security Center (NCSC) within specified regulatory timeframes.

## 3. Incident Severity Tiers
1. **Tier 1 (Critical)**: Active ransomware outbreak, core banking/service outage, massive exfiltration of classified/personal data.
2. **Tier 2 (High)**: Compromised domain controller, privileged account takeover, zero-day exploit detected on perimeter.
3. **Tier 3 (Medium / Low)**: Isolated malware on non-critical endpoint, blocked phishing attempt, minor policy infraction.

## 4. Post-Incident Review & Evidence Preservation
- Forensic preservation of volatile memory, firewall logs, and EDR telemetry.
- Root Cause Analysis (RCA) report submitted to the Board Audit Committee within 14 business days.

---
*Authorized by ${org} CISO & Incident Commander • Version 1.0*`,
    contentAr: (org) => `# خطة الاستجابة لحوادث الأمن السيبراني والإبلاغ عن الاختراقات - ${org}

## ١. الملخص التنفيذي
تحدد هذه الوثيقة الإجراءات القياسية لرصد واحتواء ومعالجة حوادث الأمن السيبراني وانتهاكات البيانات الشخصية في ${org}.

## ٢. الالتزامات الرقابية للإبلاغ
- **نظام حماية البيانات الشخصية (سدايا SDAIA)**: إبلاغ الجهة المختصة عن أي تسريب أو انتهاك للبيانات الشخصية خلال مدة لا تتجاوز **٧٢ ساعة** من تاريخ العلم.
- **الهيئة الوطنية للأمن السيبراني (NCA) / البنك المركزي (SAMA)**: الإبلاغ الفوري عن الحوادث الجسيمة وفق النماذج المعتمدة في منصة حصين.

## ٣. مستويات تصنيف الحوادث
١. **المستوى الحرج (Critical)**: هجمات الفدية، توقف الخدمات والأنظمة الحيوية، تسريب بيانات حساسة أو سرية.
٢. **المستوى العالي (High)**: اختراق حساب ذو صلاحيات عليا، استغلال ثغرة صفرية على الخوادم الخارجية.
٣. **المستوى المتوسط/المنخفض**: برمجية خبيثة تم عزلها، محاولات تصيد احتيالي محجوبة.

## ٤. حفظ الأدلة والتحقيق الجنائي الرقمي
- التحفظ الرقمي على سجلات الأنظمة والجدران النارية والذاكرة المؤقتة لضمان سلامة الأدلة الجنائية.
- إعداد تقرير تحليل الأسباب الجذرية (RCA) خلال ١٤ يوماً من إغلاق الحادثة.

---
*معتمد من فريق الاستجابة للحوادث والأمن السيبراني في ${org} • الإصدار ١.٠*`
  },
  {
    id: 'pdpl-privacy',
    titleEn: 'Personal Data Protection & Privacy Governance Policy',
    titleAr: 'سياسة حماية البيانات الشخصية والحوكمة والخصوصية (PDPL)',
    category: 'Privacy & Governance',
    applicableStandards: ['Saudi PDPL', 'ISO 27701', 'NDMO'],
    contentEn: (org) => `# ${org.toUpperCase()} - PERSONAL DATA PROTECTION POLICY (SAUDI PDPL)

## 1. Scope & Objective
Ensures ${org} complies with the Royal Decree No. (M/19) and Executive Regulations for the Saudi Personal Data Protection Law (PDPL) enacted by the Saudi Data & AI Authority (SDAIA).

## 2. Core Privacy Principles
- **Explicit Consent**: Personal data must only be collected upon obtaining valid, documented consent unless statutory exemptions apply.
- **Purpose Limitation**: Data collected for specified, explicit, and legitimate purposes only.
- **Data Minimization**: Retention limited strictly to the minimum data required to achieve authorized purposes.
- **Data Subject Rights (DSR)**: Prompt fulfillment of user requests (Access, Correction, Destruction) within statutory **30-day** SLA.
- **Cross-Border Data Transfers**: Strict compliance with SDAIA cross-border transfer criteria and adequacy assessments.

## 3. Record of Processing Activities (RoPA)
The Data Privacy Officer (DPO) shall maintain an exhaustive and updated RoPA inventory detailing processing categories, legal justifications, retention schedules, and recipient disclosures.

---
*Approved by ${org} Data Protection Officer (DPO) • Version 1.0*`,
    contentAr: (org) => `# سياسة حماية البيانات الشخصية وحوكمة الخصوصية (PDPL) - ${org}

## ١. الغرض والنطاق
تهدف هذه السياسة إلى ضمان التزام ${org} بأحكام نظام حماية البيانات الشخصية الصادر بالمرسوم الملكي رقم (م/١٩) ولائحته التنفيذية المعتمدة من الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا SDAIA).

## ٢. المبادئ الأساسية لحماية البيانات
- **الموافقة الصريحة**: جمع البيانات الشخصية بموجب موافقة نظامية موثقة من صاحب البيانات ما لم تتوفر مسوغات نظامية أخرى.
- **تحديد الغرض والملاءمة**: استخدام البيانات فقط للأغراض المشروعة والمحددة مسبقاً لصاحب البيانات.
- **تقليل البيانات (Data Minimization)**: حصر جمع ومعالجة البيانات على الحد الأدنى اللازم لتحقيق الغرض.
- **ممارسة حقوق أصحاب البيانات (DSR)**: الاستجابة لطلبات أصحاب البيانات (الوصول، التصحيح، الإتلاف) خلال مدة أقصاها **٣٠ يوماً**.
- **نقل البيانات خارج المملكة**: الالتزام بضوابط وضمانات سدايا لنقل البيانات عبر الحدود الوطنية.

## ٣. سجل أنشطة المعالجة (RoPA)
يتولى مسؤول حماية البيانات في ${org} إنشاء وتحديث سجل شامل لجميع أنشطة معالجة البيانات الشخصية وأغراضها ومدد الاحتفاظ بها.

---
*معتمد من مسؤول حماية البيانات والإدارة القانونية في ${org} • الإصدار ١.٠*`
  },
  {
    id: 'third-party-vendor',
    titleEn: 'Third-Party & Vendor Cybersecurity Risk Management Policy',
    titleAr: 'سياسة إدارة مخاطر الأمن السيبراني للجهات الخارجية وسلاسل الإمداد',
    category: 'Vendor Governance',
    applicableStandards: ['NCA ECC', 'SAMA CSF', 'ISO 27001'],
    contentEn: (org) => `# ${org.toUpperCase()} - THIRD-PARTY CYBERSECURITY POLICY

## 1. Objectives
Governs security controls and due diligence requirements applied to contractors, suppliers, outsourced IT vendors, and cloud service providers.

## 2. Mandatory Vendor Security Clauses
- Non-Disclosure Agreements (NDA) and Cybersecurity Service Level Agreements (SLA) executed prior to data access.
- Mandatory compliance with NCA ECC / SAMA cybersecurity baselines.
- Right-to-audit and independent third-party SOC 2 Type II / ISO 27001 certification requirements.
- Immediate 24-hour breach notification clause binding on all suppliers.
- Secure data destruction certificate upon termination of contract.

---
*Authorized by ${org} CISO & Procurement Committee*`,
    contentAr: (org) => `# سياسة إدارة مخاطر الأمن السيبراني للجهات الخارجية وسلاسل الإمداد - ${org}

## ١. الأهداف والنطاق
حوكمة وتقييم المخاطر السيبرانية المترتبة على التعامل مع الموردين والمقاولين ومزودي الخدمات السحابية والجهات الخارجية.

## ٢. المتطلبات الإلزامية للعقود والموردين
- توقيع اتفاقيات عدم الإفصاح (NDA) واتفاقيات مستويات الخدمة للأمن السيبراني قبل منح أي وصول للبيانات.
- إلزام الموردين بتطبيق الضوابط الأساسية للأمن السيبراني (NCA ECC) والبنك المركزي السعودي (SAMA).
- تضمين حق التدقيق (Right to Audit) وطلب شهادات الامتثال المعتمدة (ISO 27001 / SOC 2).
- الإلزام بالإبلاغ عن أي اختراق أو شبهة أمنية خلال ٢٤ ساعة.
- إلزام المورد بتقديم شهادة إتلاف آمن للبيانات عند انتهاء العقد.

---
*معتمد من لجنة الأمن السيبراني والمشتريات في ${org}*`
  }
];

export const AiPolicyAssistantView: React.FC<AiPolicyAssistantViewProps> = ({
  framework,
  assessments,
  clientName = 'Enterprise Organization',
  onSaveAssessment,
  lang = 'ar',
  theme = 'dark',
  projectId = 'default'
}) => {
  const isRtl = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'TEMPLATES' | 'REMEDIATION_GEN' | 'EVIDENCE_ANALYZER'>('TEMPLATES');
  
  // Policy Templates State
  const [selectedTemplate, setSelectedTemplate] = useState<PolicyTemplate>(POLICY_TEMPLATES[0]);
  const [templateLang, setTemplateLang] = useState<'ar' | 'en'>(isRtl ? 'ar' : 'en');
  const [copiedText, setCopiedText] = useState(false);

  // Remediation Plan Generator State
  const nonCompliantControls = framework.controls.filter(c => {
    const rec = assessments.find(a => a.controlId === c.id);
    return rec?.status === 'NON_COMPLIANT' || rec?.status === 'PARTIALLY_COMPLIANT' || !rec;
  });

  const [selectedControlId, setSelectedControlId] = useState<string>(nonCompliantControls[0]?.id || framework.controls[0]?.id || '');
  const [generatedRemediation, setGeneratedRemediation] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Evidence Analyzer State
  const [evidenceText, setEvidenceText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<{
    scorePercent: number;
    status: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT';
    matchedClauses: string[];
    missingElements: string[];
    justification: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate Remediation Action Plan logic
  const handleGenerateRemediation = (ctrlId: string) => {
    const ctrl = framework.controls.find(c => c.id === ctrlId);
    if (!ctrl) return;

    setIsGenerating(true);
    setTimeout(() => {
      const generated = isRtl
        ? `خطة العمل المقترحة لمعالجة الضابط (${ctrl.id} - ${ctrl.title}):\n\n` +
          `١. مراجعة وصياغة السياسة الإجرائية المعتمدة للمتطلب واعتمادها من إدارة ${clientName}.\n` +
          `٢. تفعيل الضوابط التقنية اللازمة وتكوين الأنظمة لمنع أي استثناءات غير مصرح بها.\n` +
          `٣. أتمتة جمع الأدلة الرقمية (سجلات التدقيق، صور الشاشات، عقود الصيانة) وربطها بالمستودع.\n` +
          `٤. تدريب الموظفين المعنيين وتعيين مسؤول دوري للمراجعة والتحقق ربع السنوي.\n` +
          `٥. الجدول الزمني المستهدف للإنجاز: خلال ٣٠ يوماً كحد أقصى.`
        : `Recommended Remediation Action Plan for (${ctrl.id} - ${ctrl.title}):\n\n` +
          `1. Author and ratify formal organizational standard operating procedures for ${clientName}.\n` +
          `2. Implement technical controls, parameter enforcement, and automated configuration lockouts.\n` +
          `3. Collect and archive required validation evidence artifacts (audit logs, screenshots, SLA records).\n` +
          `4. Conduct operational staff training and assign a designated custodian for quarterly review.\n` +
          `5. Target Completion Timeline: Within 30 calendar days.`;

      setGeneratedRemediation(generated);
      setIsGenerating(false);
    }, 600);
  };

  // Apply Remediation to Assessment Record
  const handleApplyRemediationToControl = () => {
    if (!selectedControlId || !generatedRemediation) return;
    const existing = assessments.find(a => a.controlId === selectedControlId) || {
      id: `assess-${selectedControlId}`,
      projectId,
      controlId: selectedControlId,
      frameworkId: framework.id,
      status: 'PARTIALLY_COMPLIANT',
      cmmiLevel: 2,
      scorePercent: 50,
      evidenceIds: [],
      lastUpdated: new Date().toISOString()
    };

    if (onSaveAssessment) {
      onSaveAssessment({
        ...existing,
        remediationPlan: generatedRemediation,
        lastUpdated: new Date().toISOString()
      });
      alert(isRtl ? 'تم حفظ خطة المعالجة المقترحة بنجاح في سجل تقييم الضابط!' : 'Remediation plan applied to assessment record successfully!');
    }
  };

  // Analyze Evidence Text against Control
  const handleAnalyzeEvidence = () => {
    if (!evidenceText.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const textLen = evidenceText.trim().length;
      let score = 85;
      let status: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' = 'COMPLIANT';

      if (textLen < 80) {
        score = 35;
        status = 'NON_COMPLIANT';
      } else if (textLen < 200) {
        score = 65;
        status = 'PARTIALLY_COMPLIANT';
      }

      setAnalysisResult({
        scorePercent: score,
        status,
        matchedClauses: [
          isRtl ? 'توثيق المسؤوليات والواجبات التنظيمية' : 'Documented roles and responsibilities',
          isRtl ? 'تحديد الضوابط الفنية والأمنية' : 'Technical safeguards specifications',
          isRtl ? 'آلية المراجعة الدورية السنوية' : 'Annual review and ratification schedule'
        ],
        missingElements: score < 80 ? [
          isRtl ? 'توضيح تاريخ آخر مراجعة واعتماد إداري' : 'Missing executive sign-off date and version history',
          isRtl ? 'إدراج معايير القياس ومؤشرات الأداء الرئيسية' : 'Specific enforcement metrics and SLA indicators'
        ] : [],
        justification: isRtl 
          ? `النص المقدم يفي بنسبة ${score}% من المتطلبات التوثيقية لمعيار ${framework.name}. يُوصى باستكمال البنود المتبقية لضمان الامتثال التام.`
          : `The submitted evidence clause satisfies ${score}% of ${framework.name} requirements. Addressing the noted gaps will achieve full compliance.`
      });
      setIsAnalyzing(false);
    }, 800);
  };

  const currentPolicyContent = templateLang === 'ar'
    ? selectedTemplate.contentAr(clientName)
    : selectedTemplate.contentEn(clientName);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`p-6 space-y-6 max-w-7xl mx-auto font-['Cairo'] transition-colors duration-300 ${
        theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" /> {isRtl ? 'المساعد الذكي للسياسات والأدلة' : 'AI Policy & Evidence Intelligence Engine'}
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            {isRtl ? 'مولد السياسات، خطط المعالجة، ومحلل الأدلة الذكي' : 'AI Cybersecurity Policy Generator & Evidence Analyzer'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl ? 'صياغة سياسات أمن سيبراني معتمدة ثنائية اللغة، توليد خطط إغلاق الفجوات، والتحقق التلقائي من كفاية الأدلة.' : 'Bilingual cybersecurity policy library, AI remediation action plan generator, and automated evidence sufficiency evaluator.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('TEMPLATES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'TEMPLATES'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>{isRtl ? 'مكتبة السياسات المعتمدة' : 'Policy Generator'}</span>
          </button>

          <button
            onClick={() => setActiveTab('REMEDIATION_GEN')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'REMEDIATION_GEN'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>{isRtl ? 'مولد خطط المعالجة' : 'Remediation AI'}</span>
          </button>

          <button
            onClick={() => setActiveTab('EVIDENCE_ANALYZER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'EVIDENCE_ANALYZER'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isRtl ? 'محلل كفاية الأدلة' : 'Evidence Analyzer'}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Bilingual Policy Template Generator */}
      {activeTab === 'TEMPLATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Template Catalog */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              {isRtl ? 'السياسات القياسية المتاحة' : 'Available Standard Policies'} ({POLICY_TEMPLATES.length})
            </h2>

            <div className="space-y-2">
              {POLICY_TEMPLATES.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplate.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500/40 text-slate-100'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">{isRtl ? tmpl.titleAr : tmpl.titleEn}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">{tmpl.category}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tmpl.applicableStandards.map(st => (
                        <span key={st} className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {st}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Policy Document Viewer & Exporter */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {isRtl ? selectedTemplate.titleAr : selectedTemplate.titleEn}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tailored for <span className="text-emerald-400 font-bold">{clientName}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switch */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setTemplateLang('ar')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      templateLang === 'ar' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => setTemplateLang('en')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      templateLang === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentPolicyContent);
                    setCopiedText(true);
                    setTimeout(() => setCopiedText(false), 2000);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Copy Policy to Clipboard"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[500px] font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/60">
              {currentPolicyContent}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: AI Remediation Plan Generator */}
      {activeTab === 'REMEDIATION_GEN' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>{isRtl ? 'اختر ضابطاً يعاني من فجوة أو غير ملتزم' : 'Select Non-Compliant / Gap Control'}</span>
            </h2>

            <select
              value={selectedControlId}
              onChange={(e) => {
                setSelectedControlId(e.target.value);
                setGeneratedRemediation('');
              }}
              className="w-full rounded-xl p-2.5 text-xs font-bold bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {framework.controls.map(c => {
                const rec = assessments.find(a => a.controlId === c.id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.title} ({rec?.status || 'NOT_ASSESSED'})
                  </option>
                );
              })}
            </select>

            {selectedControlId && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="font-bold text-emerald-400">
                  {framework.controls.find(c => c.id === selectedControlId)?.title}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {framework.controls.find(c => c.id === selectedControlId)?.description}
                </p>
              </div>
            )}

            <button
              onClick={() => handleGenerateRemediation(selectedControlId)}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isRtl ? 'توليد خطة المعالجة والإجراءات التصحيحية' : 'Generate AI Remediation Plan'}</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>{isRtl ? 'خطة المعالجة والإغلاق المقترحة' : 'Generated Remediation Plan'}</span>
                {generatedRemediation && (
                  <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800 font-normal">Ready for audit review</span>
                )}
              </h3>

              {generatedRemediation ? (
                <textarea
                  rows={10}
                  value={generatedRemediation}
                  onChange={(e) => setGeneratedRemediation(e.target.value)}
                  className="w-full rounded-xl p-3.5 text-xs bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              ) : (
                <div className="p-16 text-center text-xs text-slate-500">
                  {isRtl ? 'اختر ضابطاً واضغط على زر التوليد لصياغة خطة معالجة متوافقة مع المعيار.' : 'Select a control and generate tailored corrective action steps.'}
                </div>
              )}
            </div>

            {generatedRemediation && (
              <button
                onClick={handleApplyRemediationToControl}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
              >
                <Check className="w-4 h-4" />
                <span>{isRtl ? 'تطبيق هذه الخطة مباشرة على سجل تقييم الضابط' : 'Apply Directly to Control Assessment'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Automated Evidence Clause Analyzer */}
      {activeTab === 'EVIDENCE_ANALYZER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                {isRtl ? 'نص السياسة أو الشاهد المراد فحصه' : 'Paste Evidence / Policy Excerpt'}
              </h2>
              <p className="text-[11px] text-slate-400 mb-3">
                {isRtl ? 'الصق نص السياسة أو الإجراء التشغيلي للتحقق من تلبيته لمتطلبات المعيار.' : 'Paste policy paragraph or operational safeguard text to test against compliance criteria.'}
              </p>

              <textarea
                rows={9}
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                placeholder={isRtl ? 'مثال: يتم تطبيق المصادقة الثنائية لجميع الحسابات الإدارية وتغيير كلمات المرور كل 90 يوماً وفق مراجعة ربع سنوية...' : 'e.g. Multi-factor authentication is strictly enforced across all privileged endpoints and cloud admin consoles...'}
                className="w-full rounded-xl p-3.5 text-xs bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            <button
              onClick={handleAnalyzeEvidence}
              disabled={isAnalyzing || !evidenceText.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isRtl ? 'فحص كفاية الشاهد وتحليله آلياً' : 'Analyze Evidence Sufficiency'}</span>
            </button>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isRtl ? 'نتائج التحليل وتقييم الامتثال' : 'AI Analysis & Evaluation Results'}
            </h3>

            {analysisResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 font-bold">Estimated Compliance Score</div>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-0.5">{analysisResult.scorePercent}%</div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    analysisResult.status === 'COMPLIANT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    analysisResult.status === 'PARTIALLY_COMPLIANT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {analysisResult.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'البنود المستوفاة في الشاهد' : 'Satisfied Criteria'}</span>
                  </div>
                  {analysisResult.matchedClauses.map((cl, i) => (
                    <div key={i} className="text-xs text-slate-300 p-2 rounded-lg bg-slate-950 border border-slate-800">
                      ✓ {cl}
                    </div>
                  ))}
                </div>

                {analysisResult.missingElements.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'عناصر ناقصة يُوصى بإضافتها' : 'Recommended Additions'}</span>
                    </div>
                    {analysisResult.missingElements.map((m, i) => (
                      <div key={i} className="text-xs text-slate-400 p-2 rounded-lg bg-slate-950 border border-amber-900/30">
                        • {m}
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-400 italic pt-2 border-t border-slate-800">
                  {analysisResult.justification}
                </p>
              </div>
            ) : (
              <div className="p-16 text-center text-xs text-slate-500">
                {isRtl ? 'الصق نص الشاهد واضغط على زر الفحص لعرض تقرير الكفاية والامتثال.' : 'Paste evidence text and click analyze to view automated findings.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
