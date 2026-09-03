import React from 'react';

interface StandardLogoProps {
  code: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StandardLogoBadge: React.FC<StandardLogoProps> = ({ code, className = '', size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[9px]' : size === 'lg' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-xs';

  if (code.startsWith('NCA')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black flex flex-col items-center justify-center shadow-md border border-emerald-400/40 select-none ${className}`}>
        <span className="leading-none tracking-tighter">NCA</span>
        {size !== 'sm' && <span className="text-[7px] font-bold uppercase tracking-widest text-emerald-200">KSA</span>}
      </div>
    );
  }

  if (code === 'SAMA_CSF') {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-amber-600 to-yellow-700 text-white font-black flex flex-col items-center justify-center shadow-md border border-amber-400/40 select-none ${className}`}>
        <span className="leading-none tracking-tighter">SAMA</span>
        {size !== 'sm' && <span className="text-[7px] font-bold uppercase tracking-widest text-amber-200">CENTRAL</span>}
      </div>
    );
  }

  if (code.startsWith('ISO')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex flex-col items-center justify-center shadow-md border border-blue-400/40 select-none ${className}`}>
        <span className="leading-none tracking-tighter">ISO</span>
        {size !== 'sm' && <span className="text-[7px] font-bold uppercase tracking-widest text-blue-200">INTL</span>}
      </div>
    );
  }

  if (code === 'NIST_CSF') {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-black flex flex-col items-center justify-center shadow-md border border-cyan-400/40 select-none ${className}`}>
        <span className="leading-none tracking-tighter">NIST</span>
        {size !== 'sm' && <span className="text-[7px] font-bold uppercase tracking-widest text-cyan-200">CSF 2.0</span>}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-slate-200 font-bold flex items-center justify-center shadow-md border border-slate-600 select-none ${className}`}>
      <span>GRC</span>
    </div>
  );
};
