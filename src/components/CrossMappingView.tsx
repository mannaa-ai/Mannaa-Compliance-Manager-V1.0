import React, { useState } from 'react';
import type { Framework } from '../types';
import { Layers, ArrowRightLeft, Search, ShieldCheck } from 'lucide-react';

interface CrossMappingProps {
  frameworks: Framework[];
}

export const CrossMappingView: React.FC<CrossMappingProps> = ({ frameworks }) => {
  const [sourceFwId, setSourceFwId] = useState(frameworks[0]?.id || '');
  const [search, setSearch] = useState('');

  const sourceFw = frameworks.find(f => f.id === sourceFwId) || frameworks[0];

  const mappedControls = sourceFw.controls.filter(c => c.mappedControls && c.mappedControls.length > 0);

  const filteredControls = mappedControls.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.mappedControls?.some(m => m.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <ArrowRightLeft className="w-4 h-4" /> Harmonization & Interoperability
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Cross-Framework Mappings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit Once, Comply with Many. View equivalence maps between Saudi Regulations (NCA, SAMA) and International Standards (ISO 27001, NIST CSF).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-semibold">Source Standard:</label>
          <select
            value={sourceFwId}
            onChange={(e) => setSourceFwId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-blue-500"
          >
            {frameworks.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search mapped standard controls..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Mapping Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 w-32">{sourceFw.name.split(' ')[0]} Control ID</th>
              <th className="py-3.5 px-4 w-72">Requirement & Title</th>
              <th className="py-3.5 px-4">Mapped International & Regulatory Standards</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredControls.map(ctrl => (
              <tr key={ctrl.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-bold text-blue-400 align-top">
                  {ctrl.id}
                </td>
                <td className="py-3.5 px-4 align-top">
                  <div className="font-semibold text-slate-200">{ctrl.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{ctrl.description}</div>
                </td>
                <td className="py-3.5 px-4 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {ctrl.mappedControls?.map(m => {
                      const isIso = m.startsWith('ISO');
                      const isNist = m.startsWith('NIST');
                      const isNca = m.startsWith('NCA');
                      const isSama = m.startsWith('SAMA');

                      return (
                        <span 
                          key={m} 
                          className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border ${
                            isIso ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50' :
                            isNist ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' :
                            isNca ? 'bg-blue-950/60 text-blue-300 border-blue-800/50' :
                            isSama ? 'bg-amber-950/60 text-amber-300 border-amber-800/50' :
                            'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {m}
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
