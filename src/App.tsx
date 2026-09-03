import React, { useState, useEffect } from 'react';
import { db } from './db';
import { ALL_BUILTIN_FRAMEWORKS } from './data/frameworks';
import type { Project, Framework, AssessmentRecord, EvidenceItem } from './types';
import type { Language } from './utils/i18n';
import { LoginPage } from './components/LoginPage';
import { ProjectLandingPage } from './components/ProjectLandingPage';
import { Sidebar } from './components/Sidebar';
import { Overview } from './components/Overview';
import { AssessmentView } from './components/AssessmentView';
import { EvidenceVault } from './components/EvidenceVault';
import { CrossMappingView } from './components/CrossMappingView';
import { ReportsView } from './components/ReportsView';
import { ProjectModal } from './components/ProjectModal';
import { ImportFrameworkModal } from './components/ImportFrameworkModal';

export const App: React.FC = () => {
  // Requirement 3: ALWAYS redirect to login page for credentials upon opening the portal
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string } | null>(null);

  // Language state (Bilingual Arabic / English)
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('compliance_lang') as Language) || 'ar';
  });

  // Requirement 2: Dark / Light Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('compliance_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ar' : 'en';
    setLang(nextLang);
    localStorage.setItem('compliance_lang', nextLang);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('compliance_theme', nextTheme);
  };

  // App Navigation View Mode: 'landing' (Project Hub) vs 'workspace' (Inside Audit View)
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [frameworks, setFrameworks] = useState<Framework[]>(ALL_BUILTIN_FRAMEWORKS);
  const [activeFramework, setActiveFramework] = useState<Framework | null>(ALL_BUILTIN_FRAMEWORKS[0]);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Initialize DB and load active project
  useEffect(() => {
    const initData = async () => {
      const customFws = await db.customFrameworks.toArray();
      const combinedFrameworks = [...ALL_BUILTIN_FRAMEWORKS, ...customFws];
      setFrameworks(combinedFrameworks);

      const existingProjects = await db.projects.toArray();
      if (existingProjects.length === 0) {
        const defaultProj: Project = {
          id: 'proj-default-2026',
          name: 'Annual Cybersecurity & Regulatory Compliance Assessment 2026',
          organizationName: 'Enterprise Organization Baseline',
          leadAuditor: 'Lead GRC & Compliance Auditor',
          selectedFrameworks: [ALL_BUILTIN_FRAMEWORKS[0].id, ALL_BUILTIN_FRAMEWORKS[1]?.id || '', ALL_BUILTIN_FRAMEWORKS[2]?.id || ''],
          createdDate: new Date().toISOString(),
          lastModifiedDate: new Date().toISOString(),
          status: 'IN_PROGRESS',
          notes: 'Standard enterprise compliance assessment baseline across national cybersecurity regulations and international standards.'
        };
        await db.projects.add(defaultProj);
        setProjects([defaultProj]);
        setActiveProject(defaultProj);
      } else {
        setProjects(existingProjects);
        setActiveProject(existingProjects[0]);
      }

      const evList = await db.evidence.toArray();
      setEvidenceList(evList);
    };

    initData();
  }, []);

  // Load assessments when active project or active framework changes
  useEffect(() => {
    const loadAssessments = async () => {
      if (!activeProject || !activeFramework) return;
      const records = await db.assessments
        .where('projectId')
        .equals(activeProject.id)
        .filter(a => a.frameworkId === activeFramework.id)
        .toArray();

      setAssessments(records);
    };

    loadAssessments();
  }, [activeProject, activeFramework]);

  // Auth Handlers
  const handleLogin = (user: { name: string; role: string; email: string }) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewMode('landing');
  };

  // Workspace Switcher Handlers
  const handleSelectProjectFromLanding = (project: Project, targetFramework?: Framework) => {
    setActiveProject(project);
    if (targetFramework) {
      setActiveFramework(targetFramework);
    } else {
      const firstFw = frameworks.find(f => project.selectedFrameworks?.includes(f.id)) || frameworks[0];
      setActiveFramework(firstFw);
    }
    setViewMode('workspace');
    setCurrentTab('overview');
  };

  // Assessment & Data Handlers
  const handleSaveAssessment = async (record: AssessmentRecord) => {
    if (!activeProject) return;
    const recToSave = { ...record, projectId: activeProject.id };
    await db.assessments.put(recToSave);
    
    setAssessments(prev => {
      const idx = prev.findIndex(a => a.controlId === recToSave.controlId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = recToSave;
        return copy;
      }
      return [...prev, recToSave];
    });
  };

  const handleBatchSaveAssessments = async (records: AssessmentRecord[]) => {
    if (!activeProject || records.length === 0) return;
    const recsToSave = records.map(r => ({ ...r, projectId: activeProject.id }));
    await db.assessments.bulkPut(recsToSave);
    
    // Reload assessments
    if (activeFramework) {
      const updated = await db.assessments
        .where('projectId')
        .equals(activeProject.id)
        .filter(a => a.frameworkId === activeFramework.id)
        .toArray();
      setAssessments(updated);
    }
  };

  const handleAddEvidence = async (item: EvidenceItem) => {
    if (!activeProject) return;
    const itemToSave = { ...item, projectId: activeProject.id };
    await db.evidence.add(itemToSave);
    setEvidenceList(prev => [itemToSave, ...prev]);
  };

  const handleDeleteEvidence = async (id: string) => {
    await db.evidence.delete(id);
    setEvidenceList(prev => prev.filter(e => e.id !== id));
  };

  const handleCreateProject = async (newProj: Project) => {
    await db.projects.add(newProj);
    setProjects(prev => [newProj, ...prev]);
    setActiveProject(newProj);
    const firstFw = frameworks.find(f => newProj.selectedFrameworks?.includes(f.id)) || frameworks[0];
    setActiveFramework(firstFw);
    setViewMode('workspace');
  };

  const handleDeleteProject = async (id: string) => {
    await db.projects.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleImportFramework = async (newFw: Framework) => {
    await db.customFrameworks.put(newFw);
    setFrameworks(prev => [...prev, newFw]);
    setActiveFramework(newFw);
    if (viewMode === 'workspace') {
      setCurrentTab('assessment');
    }
  };

  // 1. ALWAYS show Login Screen on open
  if (!currentUser) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        lang={lang} 
        onToggleLang={toggleLanguage} 
        theme={theme} 
        onToggleTheme={toggleTheme} 
      />
    );
  }

  // 2. Landing Page / Projects Hub
  if (viewMode === 'landing') {
    return (
      <>
        <ProjectLandingPage
          user={currentUser}
          projects={projects}
          frameworks={frameworks}
          onSelectProject={handleSelectProjectFromLanding}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onLogout={handleLogout}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          lang={lang}
          onToggleLang={toggleLanguage}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <ImportFrameworkModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={handleImportFramework}
        />
      </>
    );
  }

  // Compute active project frameworks (Strict filtering)
  const projectFrameworks = frameworks.filter(f => activeProject?.selectedFrameworks?.includes(f.id));

  // 3. Inside Audit Workspace View
  return (
    <div 
      dir={lang === 'ar' ? 'rtl' : 'ltr'} 
      className={`flex h-screen font-['Cairo'] overflow-hidden transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#060b13] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        projects={projects}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
        frameworks={frameworks}
        activeFramework={activeFramework}
        setActiveFramework={setActiveFramework}
        onNewProjectModal={() => setIsProjectModalOpen(true)}
        onImportFrameworkModal={() => setIsImportModalOpen(true)}
        onBackToProjects={() => setViewMode('landing')}
        lang={lang}
        onToggleLang={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-[#060b13]/90' : 'bg-slate-50'}`}>
        {currentTab === 'overview' && (
          <Overview
            project={activeProject}
            framework={activeFramework}
            assessments={assessments}
            onNavigateToAssessment={() => setCurrentTab('assessment')}
            lang={lang}
            theme={theme}
          />
        )}

        {currentTab === 'assessment' && activeFramework && (
          <AssessmentView
            framework={activeFramework}
            assessments={assessments}
            evidenceList={evidenceList}
            onSaveAssessment={handleSaveAssessment}
            onBatchSaveAssessments={handleBatchSaveAssessments}
            onAttachEvidenceModal={() => setCurrentTab('evidence')}
            lang={lang}
            theme={theme}
            clientName={activeProject?.organizationName || 'Client Organization'}
            projectId={activeProject?.id || 'default'}
          />
        )}

        {currentTab === 'evidence' && (
          <EvidenceVault
            evidenceList={evidenceList}
            frameworks={projectFrameworks}
            assessments={assessments}
            onAddEvidence={handleAddEvidence}
            onDeleteEvidence={handleDeleteEvidence}
            lang={lang}
            theme={theme}
          />
        )}

        {currentTab === 'crossmap' && (
          <CrossMappingView frameworks={projectFrameworks.length > 0 ? projectFrameworks : frameworks} />
        )}

        {currentTab === 'reports' && activeProject && activeFramework && (
          <ReportsView
            project={activeProject}
            framework={activeFramework}
            assessments={assessments}
            evidenceList={evidenceList}
          />
        )}
      </main>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        frameworks={frameworks}
        onCreateProject={handleCreateProject}
      />

      <ImportFrameworkModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportFramework}
      />
    </div>
  );
};

export default App;
