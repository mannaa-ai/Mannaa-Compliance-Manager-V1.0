import React, { useState } from 'react';
import type { Project, Framework } from '../types';
import { Building2, Plus, Check } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  frameworks: Framework[];
  onCreateProject: (project: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  frameworks,
  onCreateProject
}) => {
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [leadAuditor, setLeadAuditor] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([frameworks[0]?.id || '']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organizationName.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      organizationName,
      leadAuditor: leadAuditor || 'Chief Compliance Officer',
      selectedFrameworks,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
      status: 'IN_PROGRESS',
      notes
    };

    onCreateProject(newProject);
    onClose();
  };

  const toggleFramework = (id: string) => {
    if (selectedFrameworks.includes(id)) {
      if (selectedFrameworks.length > 1) {
        setSelectedFrameworks(selectedFrameworks.filter(f => f !== id));
      }
    } else {
      setSelectedFrameworks([...selectedFrameworks, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" /> New Compliance Audit Workspace
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Organization / Client Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Saudi Financial Services Authority"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Project Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual NCA ECC & ISO 27001 Assessment"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Auditor / Assessor Name</label>
            <input
              type="text"
              placeholder="e.g. Mohamed Ali (Senior GRC Consultant)"
              value={leadAuditor}
              onChange={(e) => setLeadAuditor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Applicable Regulatory Frameworks</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-lg">
              {frameworks.map(f => {
                const isSelected = selectedFrameworks.includes(f.id);
                return (
                  <div
                    key={f.id}
                    onClick={() => toggleFramework(f.id)}
                    className={`p-2 rounded cursor-pointer text-xs flex items-center justify-between transition ${
                      isSelected ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-medium' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <span>{f.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
            >
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
