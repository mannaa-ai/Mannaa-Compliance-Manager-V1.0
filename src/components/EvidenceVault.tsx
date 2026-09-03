import React, { useState } from 'react';
import type { EvidenceItem, Framework, AssessmentRecord } from '../types';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';
import { 
  FolderLock, 
  Link as LinkIcon, 
  FileText, 
  Trash2, 
  ExternalLink, 
  Search, 
  Plus
} from 'lucide-react';

interface EvidenceVaultProps {
  evidenceList: EvidenceItem[];
  frameworks: Framework[];
  assessments: AssessmentRecord[];
  onAddEvidence: (item: EvidenceItem) => void;
  onDeleteEvidence: (id: string) => void;
  lang?: Language;
  theme?: 'dark' | 'light';
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({
  evidenceList,
  onAddEvidence,
  onDeleteEvidence,
  lang = 'ar',
  theme = 'dark'
}) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new evidence
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EvidenceItem['type']>('POLICY_DOC');
  const [externalUrl, setExternalUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');
  const [selectedControls, setSelectedControls] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      projectId: 'default',
      title,
      description,
      type,
      externalUrl: type === 'URL_LINK' ? externalUrl : undefined,
      fileName: type !== 'URL_LINK' ? fileName : undefined,
      fileData: type !== 'URL_LINK' ? fileData : undefined,
      associatedControls: selectedControls,
      uploadedAt: new Date().toISOString()
    };

    onAddEvidence(newItem);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setExternalUrl('');
    setFileName('');
    setFileData('');
    setSelectedControls([]);
  };

  const filteredEvidence = evidenceList.filter(item => {
    const matchesType = selectedType === 'ALL' || item.type === selectedType;
    const matchesSearch = search === '' || 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
      (item.fileName && item.fileName.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`p-6 space-y-6 max-w-7xl mx-auto font-['Cairo'] transition-colors duration-300 ${
        theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border flex flex-wrap items-center justify-between gap-4 shadow-xl ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-[#0d1522] via-[#0f1d2e] to-[#0a2328] border-slate-800' 
          : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-emerald-200 shadow-slate-200/50'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">
            <FolderLock className="w-4 h-4" /> Central Audit Vault
          </div>
          <h1 className="text-xl sm:text-2xl font-black">{t.evidenceVault}</h1>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Store policies, configurations, pentest reports, and cloud artifact links.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition"
        >
          <Plus className="w-4 h-4" /> {t.attachEvidenceBtn}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={`border rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-xl py-2 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                isRtl ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'
              } ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={`rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 border ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="ALL">All Types ({evidenceList.length})</option>
            <option value="POLICY_DOC">Policy Documents</option>
            <option value="FILE">Audit Files & Reports</option>
            <option value="SCREENSHOT">Screenshots & Proofs</option>
            <option value="URL_LINK">Cloud / Document URLs</option>
            <option value="SYSTEM_LOG">System Logs</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-400">
          {t.showingControls} <span className="text-emerald-500 font-extrabold">{filteredEvidence.length}</span>
        </span>
      </div>

      {/* Evidence Cards Grid */}
      {filteredEvidence.length === 0 ? (
        <div className={`p-12 border border-dashed rounded-3xl flex flex-col items-center justify-center text-center ${
          theme === 'dark' ? 'bg-[#0d1522]/40 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <FolderLock className="w-12 h-12 text-slate-400 mb-3" />
          <h3 className="text-sm font-bold">No Evidence Attached</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Upload policies, reports, or add cloud document links.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredEvidence.map(item => (
            <div key={item.id} className={`border rounded-2xl p-4 flex flex-col justify-between transition shadow-sm ${
              theme === 'dark' ? 'bg-[#0d1522] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-emerald-500/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded text-[10px] font-bold uppercase">
                    {item.type.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => onDeleteEvidence(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition"
                    title="Delete evidence"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold line-clamp-1">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                )}

                {item.fileName && (
                  <div className={`mt-3 p-2 rounded-xl border flex items-center gap-2 text-xs ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{item.fileName}</span>
                  </div>
                )}

                {item.externalUrl && (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-3 p-2 rounded-xl border flex items-center justify-between text-xs text-emerald-500 hover:underline transition ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.externalUrl}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400">
                <span>Mapped: {item.associatedControls.length} controls</span>
                <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Evidence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl ${
            theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="p-4 border-b border-slate-800/40 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-emerald-500" /> {t.attachEvidenceBtn}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewEvidence} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Evidence Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Information Security Policy v2.4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Evidence Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EvidenceItem['type'])}
                  className={`w-full rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500 border ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="POLICY_DOC">Policy / Procedure Document</option>
                  <option value="FILE">Audit Report / Pentest / Baseline</option>
                  <option value="SCREENSHOT">Screenshot / System Proof</option>
                  <option value="URL_LINK">Cloud / SharePoint / Drive URL</option>
                  <option value="SYSTEM_LOG">System / Audit Log Export</option>
                </select>
              </div>

              {type === 'URL_LINK' ? (
                <div>
                  <label className="block text-xs font-bold mb-1">External Web / Cloud URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://sharepoint.anmat.sa/compliance/policy.pdf"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold mb-1">Upload Document File</label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">{t.auditorNotes}</label>
                <textarea
                  rows={2}
                  placeholder="Document scope, validity dates, authors..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                    theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
