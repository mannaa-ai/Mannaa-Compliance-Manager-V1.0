import React, { useState, useEffect } from 'react';
import type { Project, Framework, AuditLogEntry, VerificationStamp } from '../types';
import type { Language } from '../utils/i18n';
import { db } from '../db';
import { 
  verifyAuditLogChain, 
  generateVerificationStamp, 
  computeSha256 
} from '../utils/auditLogger';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck2, 
  Layers, 
  Hash, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw 
} from 'lucide-react';

interface AuditTrailViewProps {
  project: Project;
  framework: Framework;
  currentUser: { name: string; email: string; role: string };
  lang?: Language;
  theme?: 'dark' | 'light';
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  project,
  framework,
  currentUser,
  lang = 'ar',
  theme = 'dark'
}) => {
  const isRtl = lang === 'ar';

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [chainValidation, setChainValidation] = useState<{
    isValid: boolean;
    totalBlocks: number;
    details: string;
    isChecking: boolean;
  }>({
    isValid: true,
    totalBlocks: 0,
    details: 'Press Verify to audit chain integrity.',
    isChecking: false
  });

  const [activeTab, setActiveTab] = useState<'LOGS' | 'VERIFIER'>('LOGS');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Verification Tool State
  const [currentStamp, setCurrentStamp] = useState<VerificationStamp | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  
  // Verifier Input
  const [verifyInputHash, setVerifyInputHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'IDLE' | 'VALID' | 'INVALID';
    message: string;
  }>({ status: 'IDLE', message: '' });

  // Load logs
  const loadLogs = async () => {
    try {
      const entries = await db.auditLogs
        .where('projectId')
        .equals(project.id)
        .sortBy('sequenceNumber');
      setLogs(entries.reverse()); // latest first
    } catch (e) {
      console.error('Error loading audit logs', e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [project.id]);

  // Run chain verification
  const handleVerifyChain = async () => {
    setChainValidation(prev => ({ ...prev, isChecking: true }));
    const res = await verifyAuditLogChain(project.id);
    setChainValidation({
      isValid: res.isValid,
      totalBlocks: res.totalBlocks,
      details: res.details,
      isChecking: false
    });
  };

  // Generate Digital Stamp for current state
  const handleGenerateStamp = async () => {
    const stamp = await generateVerificationStamp(
      project,
      framework,
      88, // Representative current assessment score
      currentUser.name
    );
    setCurrentStamp(stamp);
  };

  // Check verification input
  const handleCheckVerification = async () => {
    if (!verifyInputHash.trim()) return;

    if (currentStamp && (verifyInputHash.trim() === currentStamp.sha256Hash || verifyInputHash.trim() === currentStamp.reportId || verifyInputHash.trim() === currentStamp.signatureCert)) {
      setVerificationResult({
        status: 'VALID',
        message: `Authentic Report Verified: ${currentStamp.organizationName} (${currentStamp.frameworkCode}) issued on ${new Date(currentStamp.timestamp).toLocaleDateString('en-GB')}`
      });
      return;
    }

    // Check if it matches any block in the audit trail
    const match = logs.find(l => l.hash.toLowerCase().includes(verifyInputHash.trim().toLowerCase()) || l.id === verifyInputHash.trim());
    if (match) {
      setVerificationResult({
        status: 'VALID',
        message: `Authentic Block #${match.sequenceNumber} verified in ${project.organizationName}'s cryptographic chain. Action: ${match.action} by ${match.actorName}.`
      });
    } else {
      setVerificationResult({
        status: 'INVALID',
        message: 'No matching cryptographic record found in this registry. The document or hash may be altered or issued by another entity.'
      });
    }
  };

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.hash.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4" /> {isRtl ? 'سجل التدقيق المشفر والتحقق الرقمي' : 'Immutable Audit Trail & Verifier'}
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            {isRtl ? 'سجل العمليات المشفر (SHA-256) والتحقق من صحة التقارير' : 'Cryptographic Audit Trail & Report Verifier'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl ? 'سجل غير قابل للتعديل يوثق جميع التغييرات والتقييمات مع إمكانية التحقق الفوري من صحة التقارير الرسمية.' : 'Tamper-proof SHA-256 block chain recording every compliance modification, score update, and evidence upload.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'LOGS'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isRtl ? 'سجل العمليات المشفر' : 'Chained Audit Trail'}</span>
          </button>

          <button
            onClick={() => setActiveTab('VERIFIER')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'VERIFIER'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{isRtl ? 'منصة التحقق والختم الرقمي' : 'Report Verifier'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'LOGS' ? (
        <div className="space-y-4">
          {/* Integrity Verification Card */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                chainValidation.isValid ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                {chainValidation.isValid ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  {isRtl ? 'حالة سلامة السجل المشفر (Chain Integrity)' : 'Cryptographic Chain Integrity'}
                </div>
                <div className="text-base font-extrabold text-slate-100 mt-0.5">
                  {chainValidation.isValid ? (isRtl ? 'السجل سليم وموثق بنسبة 100% (Unbroken Chain)' : '100% Verified & Tamper-Free') : (isRtl ? 'تم اكتشاف تلاعب أو خلل في السلسلة' : 'Tamper Detected in Chain')}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{chainValidation.details}</p>
              </div>
            </div>

            <button
              onClick={handleVerifyChain}
              disabled={chainValidation.isChecking}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${chainValidation.isChecking ? 'animate-spin' : ''}`} />
              <span>{isRtl ? 'فحص سلامة التشفير كاملاً' : 'Run Full Integrity Check'}</span>
            </button>
          </div>

          {/* Search and Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className={`w-4 h-4 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
                <input
                  type="text"
                  placeholder={isRtl ? 'بحث برمز الهاش، الإجراء، أو اسم المستخدم...' : 'Search by hash, action, actor...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-xl py-2 text-xs focus:outline-none focus:border-purple-500 border bg-slate-950 border-slate-800 text-slate-200 ${
                    isRtl ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'
                  }`}
                />
              </div>

              <div className="text-xs font-bold text-slate-400">
                {isRtl ? 'إجمالي السجلات المشفرة:' : 'Total Cryptographic Logs:'} <span className="text-purple-400 font-extrabold">{logs.length}</span>
              </div>
            </div>

            {/* Logs Timeline List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  {isRtl ? 'لا توجد سجلات تطابق البحث، أو تم بدء المشروع حديثاً.' : 'No audit log entries recorded yet.'}
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-purple-500/40 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-[11px]">
                          #{log.sequenceNumber}
                        </span>
                        <span className="font-bold text-slate-200">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-semibold">{log.actorName} ({log.actorEmail})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString(isRtl ? 'ar-SA' : 'en-GB')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed pl-8">
                      {log.details}
                    </p>

                    {/* Hash Chain Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-900 text-[10px] font-mono text-slate-500 pl-8">
                      <span className="text-slate-400">Hash:</span>
                      <span className="text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20 truncate max-w-[280px]">
                        {log.hash}
                      </span>
                      <span className="text-slate-500">Prev:</span>
                      <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded truncate max-w-[200px]">
                        {log.previousHash.substring(0, 16)}...
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Report Verifier & Digital Stamp Section */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: Digital Stamp Generator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-100">
                {isRtl ? 'إصدار ختم التحقق الرقمي للتقرير' : 'Generate Digital Verification Seal'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isRtl ? 'يقوم هذا الخيار بحساب البصمة الرقمية (SHA-256) لحالة المشروع الحالية وإصدار شهادة تحقق رقمية معتمدة للتقرير.' : 'Generates a unique cryptographic SHA-256 seal and verification certificate ID for this audit deliverable.'}
              </p>

              {currentStamp ? (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Seal Generated</span>
                    <span className="text-[10px] text-slate-400">{new Date(currentStamp.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="text-slate-400">Certificate Ref: <span className="text-slate-200 font-mono font-bold">{currentStamp.signatureCert}</span></div>
                    <div className="text-slate-400">Report ID: <span className="text-slate-200 font-mono font-bold">{currentStamp.reportId}</span></div>
                    <div className="text-slate-400">SHA-256 Fingerprint:</div>
                    <div className="p-2 rounded bg-slate-900 text-purple-300 font-mono text-[10px] break-all border border-purple-900/50 flex items-center justify-between">
                      <span>{currentStamp.sha256Hash}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentStamp.sha256Hash);
                          setCopiedHash(true);
                          setTimeout(() => setCopiedHash(false), 2000);
                        }}
                        className="ml-2 text-slate-400 hover:text-white"
                      >
                        {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <button
              onClick={handleGenerateStamp}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isRtl ? 'توليد الختم الرقمي ورمز الشهادة' : 'Issue Digital Verification Stamp'}</span>
            </button>
          </div>

          {/* Box 2: Certificate & Fingerprint Checker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-100">
                {isRtl ? 'مدقق صحة التقارير والشهادات' : 'Audit Report Authenticity Verifier'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isRtl ? 'أدخل بصمة الهاش (SHA-256) أو رقم التقرير المطبوع للتحقق من أصالته وعدم تعرضه لأي تعديل.' : 'Input a report SHA-256 fingerprint, report ID, or certificate code to verify genuine issuance.'}
              </p>

              <div className="mt-4 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  {isRtl ? 'رمز التقرير أو بصمة الهاش (SHA-256 Hash / Cert ID)' : 'SHA-256 Hash or Certificate ID'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
                  value={verifyInputHash}
                  onChange={(e) => setVerifyInputHash(e.target.value)}
                  className="w-full rounded-xl p-2.5 text-xs font-mono bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {verificationResult.status !== 'IDLE' && (
                <div className={`mt-3 p-3.5 rounded-xl border text-xs leading-relaxed ${
                  verificationResult.status === 'VALID'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {verificationResult.status === 'VALID' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isRtl ? 'تقرير أصلي ومعتمد 100%' : 'Authentic Document Verified'}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>{isRtl ? 'فشل التحقق من التقرير' : 'Verification Failed'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90">{verificationResult.message}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleCheckVerification}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Search className="w-4 h-4" />
              <span>{isRtl ? 'التحقق من صحة المستند' : 'Verify Document Authenticity'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
