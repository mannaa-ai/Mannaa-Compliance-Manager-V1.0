import React, { useState } from 'react';
import type { Framework } from '../types';
import { UploadCloud, FileSpreadsheet, Code, Check, AlertCircle, Download } from 'lucide-react';
import { parseFrameworkFromExcel, parseFrameworkFromJSON, exportFrameworkTemplateExcel } from '../utils/importer';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (framework: Framework) => void;
}

export const ImportFrameworkModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [importMode, setImportMode] = useState<'EXCEL' | 'JSON'>('EXCEL');
  const [frameworkName, setFrameworkName] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successPreview, setSuccessPreview] = useState<Framework | null>(null);

  if (!isOpen) return null;

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setSuccessPreview(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const parsed = parseFrameworkFromExcel(buffer, frameworkName || file.name.replace(/\.[^/.]+$/, ''));
        setSuccessPreview(parsed);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleJSONParse = () => {
    setErrorMsg('');
    setSuccessPreview(null);
    try {
      const parsed = parseFrameworkFromJSON(jsonText);
      setSuccessPreview(parsed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse JSON string.');
    }
  };

  const handleConfirmImport = () => {
    if (successPreview) {
      onImportSuccess(successPreview);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-blue-400" /> Import Custom Compliance Framework
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm font-bold">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => { setImportMode('EXCEL'); setErrorMsg(''); setSuccessPreview(null); }}
              className={`py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition ${
                importMode === 'EXCEL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel Spreadsheet (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => { setImportMode('JSON'); setErrorMsg(''); setSuccessPreview(null); }}
              className={`py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition ${
                importMode === 'JSON' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Custom JSON
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Framework / Standard Name</label>
            <input
              type="text"
              placeholder="e.g. Internal Security Standard 2026"
              value={frameworkName}
              onChange={(e) => setFrameworkName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {importMode === 'EXCEL' ? (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center">
                <FileSpreadsheet className="w-8 h-8 text-blue-400 mb-2" />
                <label className="cursor-pointer text-xs font-semibold text-blue-400 hover:text-blue-300">
                  <span>Click to select an Excel (.xlsx) file</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">Columns supported: Domain, Sub Domain, Control ID, Title, Description, Guidance, Weight</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={exportFrameworkTemplateExcel}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download Excel Format Template
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Paste Framework JSON</label>
              <textarea
                rows={6}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{"name": "Custom Standard", "domains": [...], "controls": [...]}'
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleJSONParse}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition"
              >
                Validate JSON
              </button>
            </div>
          )}

          {/* Error / Success feedback */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successPreview && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Ready: <strong>{successPreview.controls.length}</strong> controls across <strong>{successPreview.domains.length}</strong> domains parsed.</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!successPreview}
              onClick={handleConfirmImport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
            >
              Import & Load Framework
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
