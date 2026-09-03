import React, { useState } from 'react';
import { Lock, User, ArrowRight, CheckCircle2, Globe, Moon, Sun } from 'lucide-react';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

interface LoginPageProps {
  onLogin: (user: { name: string; role: string; email: string }) => void;
  lang: Language;
  onToggleLang: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLogin, 
  lang, 
  onToggleLang, 
  theme, 
  onToggleTheme 
}) => {
  const t = translations[lang];

  // Credentials (Always English on Login Page)
  const [email, setEmail] = useState('auditor@anmat.sa');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Mohamed Ali');
  const [role, setRole] = useState('Lead GRC & Compliance Auditor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name, role, email });
  };

  return (
    <div 
      dir="ltr" 
      className={`min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden font-['Cairo'] transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-[#060b13] text-slate-100' 
          : 'bg-[#f0f9f8] text-slate-900'
      }`}
      style={{
        backgroundImage: theme === 'light' ? 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, rgba(240, 249, 248, 1) 100%)' : undefined
      }}
    >
      {/* Top Action Controls (Lang & Theme) */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-30">
        <button
          onClick={onToggleLang}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
            theme === 'dark' 
              ? 'bg-slate-900/80 border-slate-800 text-emerald-400 hover:bg-slate-800' 
              : 'bg-white border-slate-200 text-emerald-600 hover:bg-slate-50 shadow-sm'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t.switchLang}</span>
        </button>

        <button
          onClick={onToggleTheme}
          className={`p-2.5 rounded-xl text-xs font-bold transition border ${
            theme === 'dark' 
              ? 'bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
          }`}
          title={theme === 'dark' ? t.lightTheme : t.darkTheme}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card with exact visual styling */}
      <div className={`w-full max-w-[420px] backdrop-blur-xl rounded-[32px] p-8 shadow-2xl relative z-10 border transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-[#0d1522]/95 border-slate-800/90 shadow-black/70' 
          : 'bg-white/95 border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
      }`}>
        {/* Brand Header with New logo1.png */}
        <div className="text-center mb-7 flex flex-col items-center">
          <div className="mb-3 flex items-center justify-center p-2 rounded-2xl max-w-[200px]">
            <img 
              src="./logos/logo1.png" 
              alt="ANMAT Technology" 
              className="max-h-16 w-auto object-contain filter drop-shadow-sm"
              onError={(e) => {
                e.currentTarget.src = './logo1.png';
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs font-black tracking-wider text-emerald-500 uppercase">ANMAT TECHNOLOGY</span>
          </div>
          <h1 className={`text-2xl font-black tracking-wide ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
            COMPLIANCE MANAGER
          </h1>
          <p className="text-xs text-slate-500 mt-1">anmat.sa • Saudi GRC & Audit Suite</p>
        </div>

        {/* Credentials Form (English labels) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Auditor / Assessor Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-2xl py-3 pl-10 pr-3.5 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-slate-200' 
                    : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Professional Role / Title
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                theme === 'dark' 
                  ? 'bg-slate-950 border-slate-800 text-slate-200' 
                  : 'bg-white border-slate-300 text-slate-900 shadow-xs'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                theme === 'dark' 
                  ? 'bg-slate-950 border-slate-800 text-slate-200' 
                  : 'bg-white border-slate-300 text-slate-900 shadow-xs'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-2xl py-3 pl-10 pr-3.5 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-slate-200' 
                    : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 hover:shadow-xl transition duration-200 mt-4 cursor-pointer"
          >
            <span>Sign In to Audit Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className={`mt-6 pt-5 border-t flex items-center justify-between text-[11px] ${
          theme === 'dark' ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}>
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Encrypted Local Vault</span>
          </div>
          <span className="font-medium">Offline Desktop Ready</span>
        </div>
      </div>
    </div>
  );
};
