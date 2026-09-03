import React from 'react';
import type { Framework, Project } from '../types';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';
import { StandardLogoBadge } from './StandardLogoBadge';
import { 
  Layers, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  BarChart3, 
  FolderLock, 
  Plus, 
  Building2, 
  ChevronRight, 
  Database, 
  Download, 
  ArrowLeft,
  Globe,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { exportFrameworkTemplateExcel } from '../utils/importer';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (p: Project) => void;
  frameworks: Framework[];
  activeFramework: Framework | null;
  setActiveFramework: (f: Framework) => void;
  onNewProjectModal: () => void;
  onImportFrameworkModal: () => void;
  onBackToProjects: () => void;
  lang: Language;
  onToggleLang: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  projects,
  activeProject,
  setActiveProject,
  frameworks,
  activeFramework,
  setActiveFramework,
  onNewProjectModal,
  onImportFrameworkModal,
  onBackToProjects,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  onLogout
}) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  return (
    <aside className={`w-72 border-r flex flex-col h-screen select-none shrink-0 transition-colors duration-300 font-['Cairo'] ${
      theme === 'dark' ? 'bg-[#0a101b] border-slate-800/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      {/* Brand Header with ANMAT Logo (logo1.png) */}
      <div className="p-3.5 border-b border-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="max-w-[120px] flex items-center">
            <img 
              src="./logos/logo1.png" 
              alt="ANMAT" 
              className="max-h-9 w-auto object-contain" 
              onError={(e) => {
                e.currentTarget.src = './logo1.png';
              }}
            />
          </div>
          <div>
            <h1 className="font-black text-xs tracking-wider text-emerald-500 uppercase">ANMAT.SA</h1>
            <p className="text-[9px] text-slate-400 font-semibold">{t.appName}</p>
          </div>
        </div>

        <button
          onClick={onBackToProjects}
          title={t.backToProjects}
          className={`p-1.5 rounded-xl text-xs transition flex items-center gap-1 border ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Workspace Quick Controls (Lang & Theme & Logout) */}
      <div className={`px-3 py-2 border-b flex items-center justify-between text-xs ${
        theme === 'dark' ? 'border-slate-800/40 bg-slate-950/40' : 'border-slate-100 bg-slate-50'
      }`}>
        <button
          onClick={onToggleLang}
          className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
        >
          <Globe className="w-3 h-3" />
          <span>{t.switchLang}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-1 rounded-lg text-slate-400 hover:text-amber-400"
            title={theme === 'dark' ? t.lightTheme : t.darkTheme}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onLogout}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
            title={t.signOutBtn}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Project Switcher */}
      <div className={`p-3 border-b ${
        theme === 'dark' ? 'border-slate-800/60 bg-slate-950/20' : 'border-slate-100 bg-slate-50/50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-500" /> {t.activeWorkspaces}
          </span>
          <button 
            onClick={onNewProjectModal}
            className="p-1 text-xs text-emerald-500 hover:text-emerald-400 rounded transition"
            title={t.createNewProject}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <select
          value={activeProject?.id || ''}
          onChange={(e) => {
            const p = projects.find(proj => proj.id === e.target.value);
            if (p) setActiveProject(p);
          }}
          className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-emerald-500 border ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.organizationName} — {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <div>
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-2 mb-2">
            {t.auditWorkspace}
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setCurrentTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                currentTab === 'overview'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t.complianceAnalytics}</span>
            </button>

            <button
              onClick={() => setCurrentTab('assessment')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                currentTab === 'assessment'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.controlsAssessment}</span>
            </button>

            <button
              onClick={() => setCurrentTab('evidence')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                currentTab === 'evidence'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FolderLock className="w-4 h-4" />
              <span>{t.evidenceVault}</span>
            </button>

            <button
              onClick={() => setCurrentTab('crossmap')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                currentTab === 'crossmap'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.crossFrameworkMappings}</span>
            </button>

            <button
              onClick={() => setCurrentTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                currentTab === 'reports'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t.reportsDeliverables}</span>
            </button>
          </nav>
        </div>

        {/* Project Standards List (Filtered strictly to active project with official logos) */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase">
              {t.projectStandards} ({frameworks.filter(f => activeProject?.selectedFrameworks?.includes(f.id)).length})
            </span>
            <button
              onClick={onImportFrameworkModal}
              className="text-[11px] text-emerald-500 hover:text-emerald-400 font-bold flex items-center gap-1"
              title={t.importCustomStandard}
            >
              <UploadCloud className="w-3 h-3" /> {t.importBtn}
            </button>
          </div>

          <div className="space-y-1.5">
            {frameworks
              .filter(fw => activeProject?.selectedFrameworks?.includes(fw.id))
              .map((fw) => {
                const isSelected = activeFramework?.id === fw.id;
                return (
                  <button
                    key={fw.id}
                    onClick={() => setActiveFramework(fw)}
                    className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs transition flex items-center justify-between group border ${
                      isSelected
                        ? 'bg-emerald-950/50 text-emerald-300 font-bold border-emerald-500/40 shadow-sm'
                        : theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/60' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-1">
                      <StandardLogoBadge code={fw.code} size="sm" />
                      <div className="truncate">
                        <div className="truncate font-bold text-xs">{fw.name}</div>
                        <div className="text-[10px] opacity-75 mt-0.5">{fw.jurisdiction} • {fw.controls.length} controls</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'} ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className={`p-3 border-t flex items-center justify-between text-xs ${
        theme === 'dark' ? 'border-slate-800/60 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
      }`}>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>Offline SQLite Vault</span>
        </div>
        <button
          onClick={exportFrameworkTemplateExcel}
          title="Download Excel Framework Template"
          className="text-[11px] text-emerald-500 hover:text-emerald-400 flex items-center gap-1 font-bold"
        >
          <Download className="w-3 h-3" /> {t.downloadTemplate}
        </button>
      </div>
    </aside>
  );
};
