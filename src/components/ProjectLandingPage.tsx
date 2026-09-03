import React, { useState } from 'react';
import type { Project, Framework } from '../types';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';
import { StandardLogoBadge } from './StandardLogoBadge';
import { 
  Plus, 
  FolderGit2, 
  Building2, 
  Calendar, 
  User, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Trash2,
  UploadCloud,
  LogOut,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

interface ProjectLandingPageProps {
  user: { name: string; role: string; email: string };
  projects: Project[];
  frameworks: Framework[];
  onSelectProject: (p: Project, targetFramework?: Framework) => void;
  onCreateProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
  onLogout: () => void;
  onOpenImportModal: () => void;
  lang: Language;
  onToggleLang: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const ProjectLandingPage: React.FC<ProjectLandingPageProps> = ({
  user,
  projects,
  frameworks,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onLogout,
  onOpenImportModal,
  lang,
  onToggleLang,
  theme,
  onToggleTheme
}) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const [isCreating, setIsCreating] = useState(false);

  // New Project Form State
  const [projectName, setProjectName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [leadAuditor, setLeadAuditor] = useState(user.name);
  const [projectNotes, setProjectNotes] = useState('');
  const [selectedFrameworkIds, setSelectedFrameworkIds] = useState<string[]>([frameworks[0]?.id || '']);

  const handleToggleFramework = (fwId: string) => {
    if (selectedFrameworkIds.includes(fwId)) {
      if (selectedFrameworkIds.length > 1) {
        setSelectedFrameworkIds(selectedFrameworkIds.filter(id => id !== fwId));
      }
    } else {
      setSelectedFrameworkIds([...selectedFrameworkIds, fwId]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !organizationName.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectName,
      organizationName,
      leadAuditor: leadAuditor || user.name,
      selectedFrameworks: selectedFrameworkIds,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
      status: 'IN_PROGRESS',
      notes: projectNotes
    };

    onCreateProject(newProject);
    setIsCreating(false);
    setProjectName('');
    setOrganizationName('');
    setProjectNotes('');
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`min-h-screen flex flex-col font-['Cairo'] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#060b13] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Navigation Bar with Anmat Logo & Controls */}
      <header className={`border-b backdrop-blur-md px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 transition-colors ${
        theme === 'dark' ? 'border-slate-800/80 bg-[#0d1522]/90' : 'border-slate-200 bg-white/90 shadow-sm'
      }`}>
        <div className="flex items-center gap-4">
          <div className="max-w-[150px] flex items-center">
            <img 
              src="./logos/logo1.png" 
              alt="ANMAT Technology" 
              className="max-h-11 w-auto object-contain" 
              onError={(e) => {
                e.currentTarget.src = './logo1.png';
              }}
            />
          </div>
          <div className="hidden sm:block border-l border-slate-700/40 pl-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-wider text-emerald-500 uppercase">ANMAT.SA</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {t.appName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenImportModal}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              theme === 'dark' 
                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/60 text-slate-200' 
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-500" /> 
            <span>{t.importCustomStandard}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              theme === 'dark' 
                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/60 text-emerald-400' 
                : 'bg-white hover:bg-slate-100 border-slate-300 text-emerald-600 shadow-sm'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t.switchLang}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl text-xs font-bold transition border ${
              theme === 'dark' 
                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/60 text-amber-400' 
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
            }`}
            title={theme === 'dark' ? t.lightTheme : t.darkTheme}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold">{user.name}</div>
              <div className="text-[10px] text-emerald-500 font-medium">{user.role}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition"
              title={t.signOutBtn}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-8">
        {/* Welcome Banner */}
        <div className={`p-8 rounded-3xl border relative overflow-hidden flex flex-wrap items-center justify-between gap-6 shadow-xl transition-colors ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-[#0d1522] via-[#0f1d2e] to-[#0a2328] border-slate-800/90' 
            : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-emerald-100'
        }`}>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> anmat.sa GRC & Audit Hub
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
              {t.projectsHub}
            </h1>
            <p className={`text-xs mt-2 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.projectsHubSub}
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-emerald-900/30 transition duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>{t.createNewProject}</span>
          </button>
        </div>

        {/* Existing Projects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-emerald-500" /> {t.activeWorkspaces} ({projects.length})
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className={`p-12 border border-dashed rounded-3xl flex flex-col items-center justify-center text-center ${
              theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <FolderGit2 className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="text-sm font-bold">{t.noProjectsFound}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {t.noProjectsFoundSub}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => {
                const assignedFrameworks = frameworks.filter(f => proj.selectedFrameworks?.includes(f.id));

                return (
                  <div
                    key={proj.id}
                    className={`border rounded-3xl p-6 flex flex-col justify-between transition group shadow-lg ${
                      theme === 'dark' 
                        ? 'bg-[#0d1522]/90 border-slate-800 hover:border-emerald-500/50' 
                        : 'bg-white border-slate-200 hover:border-emerald-500/50 shadow-slate-200/50'
                    }`}
                  >
                    <div>
                      {/* Organization & Delete */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                          <Building2 className="w-4 h-4" />
                          <span>{proj.organizationName}</span>
                        </div>

                        {projects.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteProject(proj.id); }}
                            className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Project Title */}
                      <h3 className="text-base font-extrabold mb-2 group-hover:text-emerald-500 transition">
                        {proj.name}
                      </h3>

                      {proj.notes && (
                        <p className="text-xs text-slate-400 line-clamp-2 mb-4">{proj.notes}</p>
                      )}

                      {/* Auditor & Date */}
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-4 pb-4 border-b border-slate-800/40">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{proj.leadAuditor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(proj.createdDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Assigned Standards Badges with Official Logos */}
                      <div className="space-y-2.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {t.projectStandards} ({assignedFrameworks.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {assignedFrameworks.map(fw => (
                            <button
                              key={fw.id}
                              onClick={() => onSelectProject(proj, fw)}
                              className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition ${
                                theme === 'dark' 
                                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200' 
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                              }`}
                            >
                              <StandardLogoBadge code={fw.code} size="sm" />
                              <span className="truncate max-w-[150px]">{fw.name.split(' ')[0]} {fw.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Enter Workspace Button */}
                    <div className="mt-6 pt-4 border-t border-slate-800/40">
                      <button
                        onClick={() => onSelectProject(proj)}
                        className="w-full py-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/30 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition duration-200"
                      >
                        <span>{t.openWorkspace}</span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create New Project Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`border rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl ${
            theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="p-6 border-b border-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">{t.createNewProject}</h2>
                  <p className="text-xs text-slate-400">{t.targetStandards}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">{t.clientOrgName} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saudi Enterprise"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">{t.projectAuditName} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NCA ECC & ISO 27001 Audit 2026"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">{t.leadAuditor}</label>
                <input
                  type="text"
                  value={leadAuditor}
                  onChange={(e) => setLeadAuditor(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Framework Multi-Selector with Logos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider">
                    {t.targetStandards} ({selectedFrameworkIds.length})
                  </label>
                  <span className="text-[11px] text-emerald-500 font-bold">{t.selectMultiple}</span>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-2.5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  {frameworks.map((fw) => {
                    const isSelected = selectedFrameworkIds.includes(fw.id);
                    return (
                      <div
                        key={fw.id}
                        onClick={() => handleToggleFramework(fw.id)}
                        className={`p-3 rounded-2xl cursor-pointer border transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-sm'
                            : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <StandardLogoBadge code={fw.code} size="md" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black truncate">{fw.name}</div>
                            <div className="text-[10px] opacity-75 mt-0.5">{fw.jurisdiction} • {fw.controls.length} controls</div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-400 bg-slate-200 dark:border-slate-600 dark:bg-slate-800'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">{t.projectScope}</label>
                <textarea
                  rows={2}
                  placeholder="Scope details, systems, stakeholder contacts..."
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  className={`w-full rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition border ${
                    theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 transition"
                >
                  {t.createAndStart}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
