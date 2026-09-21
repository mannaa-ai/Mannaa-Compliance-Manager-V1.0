import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Moon, 
  Sun, 
  ShieldCheck, 
  KeyRound, 
  QrCode, 
  Copy, 
  Check, 
  AlertCircle, 
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';
import type { UserAccount } from '../types';
import { 
  hashPassword, 
  generateMfaSecret, 
  generateTotpUri, 
  generateQrCodeDataUrl, 
  verifyTotpToken, 
  generateBackupCodes,
  getStoredUsers,
  saveStoredUsers
} from '../utils/auth';

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

  // Primary Credentials (No Role selector on login page)
  const [email, setEmail] = useState('auditor@anmat.sa');
  const [password, setPassword] = useState('AnmatCompliance2026!');
  const [rememberDevice, setRememberDevice] = useState(true);

  // Authentication Flow State: 'CREDENTIALS' -> 'MFA_VERIFY' -> 'MFA_SETUP' -> 'BACKUP_CODE'
  const [authStep, setAuthStep] = useState<'CREDENTIALS' | 'MFA_VERIFY' | 'MFA_SETUP' | 'BACKUP_CODE'>('CREDENTIALS');
  
  // Active User Authenticating
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // MFA OTP Input (6 individual digit boxes)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // MFA Setup State
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [mfaSecret, setMfaSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Backup Code Input
  const [backupCodeInput, setBackupCodeInput] = useState('');

  // Error & Status Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-seed default users if none exist
  useEffect(() => {
    getStoredUsers();
  }, []);

  // Step 1: Handle Primary Credentials Submission
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const users = await getStoredUsers();
      const targetUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      if (!targetUser) {
        throw new Error('User account not found. Please check your email address.');
      }

      if (!targetUser.isActive) {
        throw new Error('This account has been deactivated by the administrator.');
      }

      // Check Password Hash
      const computedHash = await hashPassword(password, targetUser.salt);
      if (computedHash !== targetUser.passwordHash) {
        throw new Error('Invalid master password. Please verify and try again.');
      }

      setCurrentUser(targetUser);

      // Check if MFA is configured
      if (!targetUser.mfaEnabled) {
        // First time MFA setup: Generate QR Code
        const secret = targetUser.mfaSecret || generateMfaSecret();
        const uri = generateTotpUri(targetUser.email, secret);
        const qrUrl = await generateQrCodeDataUrl(uri);
        const bCodes = targetUser.backupCodes?.length ? targetUser.backupCodes : generateBackupCodes();

        setMfaSecret(secret);
        setQrCodeDataUrl(qrUrl);
        setBackupCodes(bCodes);

        setAuthStep('MFA_SETUP');
      } else {
        // MFA is already configured -> Proceed to Step 2 Verification
        setAuthStep('MFA_VERIFY');
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP Digits Change & Auto-Focus
  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto focus next box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits are filled
    if (newDigits.every(d => d !== '') && index === 5) {
      const fullOtp = newDigits.join('');
      verifyMfaCode(fullOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
      verifyMfaCode(pasted);
    }
  };

  // Verify TOTP Code
  const verifyMfaCode = async (token: string) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!currentUser) throw new Error('User session missing.');

      const secretToTest = authStep === 'MFA_SETUP' ? mfaSecret : currentUser.mfaSecret;
      const isValid = verifyTotpToken(token, secretToTest);

      if (!isValid) {
        throw new Error('Invalid 6-digit authenticator code. Ensure time sync on your phone authenticator.');
      }

      const users = await getStoredUsers();
      const updatedUsers = users.map(u => {
        if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return {
            ...u,
            mfaSecret: secretToTest,
            mfaEnabled: true,
            backupCodes: authStep === 'MFA_SETUP' ? backupCodes : u.backupCodes,
            lastLogin: new Date().toISOString()
          };
        }
        return u;
      });
      saveStoredUsers(updatedUsers);

      if (rememberDevice) {
        localStorage.setItem('anmat_mfa_trusted_until', String(Date.now() + 30 * 24 * 3600 * 1000));
      }

      onLogin({
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'MFA validation failed.');
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Verify Single-Use Backup Recovery Code
  const handleVerifyBackupCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) return;
    const cleanCode = backupCodeInput.trim();

    if (currentUser.backupCodes && currentUser.backupCodes.includes(cleanCode)) {
      // Consume the backup code
      const remainingCodes = currentUser.backupCodes.filter(c => c !== cleanCode);
      const users = await getStoredUsers();
      const updatedUsers = users.map(u => {
        if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return {
            ...u,
            backupCodes: remainingCodes,
            lastLogin: new Date().toISOString()
          };
        }
        return u;
      });
      saveStoredUsers(updatedUsers);

      onLogin({
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email
      });
    } else {
      setErrorMessage('Invalid or already consumed backup code.');
    }
  };

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(mfaSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
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
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer ${
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
          className={`p-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
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

      {/* Main Glassmorphic Security Container */}
      <div className={`w-full max-w-[440px] backdrop-blur-xl rounded-[32px] p-8 shadow-2xl relative z-10 border transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-[#0d1522]/95 border-slate-800/90 shadow-black/70' 
          : 'bg-white/95 border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
      }`}>
        {/* Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
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
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-black tracking-wider text-emerald-500 uppercase">ANMAT SECURE GATEWAY</span>
          </div>
          <h1 className={`text-2xl font-black tracking-wide ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
            COMPLIANCE MANAGER
          </h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise GRC & Audit Access Control</p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: PRIMARY CREDENTIALS (Email & Password - No Role selector) */}
        {authStep === 'CREDENTIALS' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                Assessor / Auditor Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@anmat.sa"
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
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full rounded-2xl py-3 pl-10 pr-3.5 text-xs focus:outline-none focus:border-emerald-500 transition border ${
                    theme === 'dark' 
                      ? 'bg-slate-950 border-slate-800 text-slate-200' 
                      : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-0"
                />
                <span>Trust this device for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 hover:shadow-xl transition duration-200 mt-4 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT MFA TOTP VERIFICATION */}
        {authStep === 'MFA_VERIFY' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-100">Multi-Factor Authentication (MFA)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter the 6-digit code from Google Authenticator or Microsoft Authenticator for <strong>{currentUser?.email}</strong>.
              </p>
            </div>

            {/* 6 Individual Digit Boxes */}
            <div className="flex items-center justify-center gap-2.5" onPaste={handlePasteOtp}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-12 h-14 text-center text-xl font-black rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    theme === 'dark' 
                      ? 'bg-slate-950 border-slate-800 text-emerald-400' 
                      : 'bg-slate-50 border-slate-300 text-emerald-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => verifyMfaCode(otpDigits.join(''))}
              disabled={isLoading || otpDigits.some(d => d === '')}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Access Portal</span>}
            </button>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => setAuthStep('BACKUP_CODE')}
                className="hover:text-emerald-400 font-medium cursor-pointer"
              >
                Use Emergency Recovery Code
              </button>
              <button
                type="button"
                onClick={() => setAuthStep('CREDENTIALS')}
                className="hover:text-slate-200 font-medium flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INITIAL MFA SETUP (QR CODE SCAN) */}
        {authStep === 'MFA_SETUP' && (
          <div className="space-y-4 animate-fade-in text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl">
              <QrCode className="w-4 h-4" />
              <span>Initial MFA Pairing Required</span>
            </div>

            <p className="text-xs text-slate-400">
              Pair your account with <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>1Password</strong>.
            </p>

            {qrCodeDataUrl && (
              <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mx-auto border border-slate-200">
                <img src={qrCodeDataUrl} alt="MFA QR Code" className="w-44 h-44 object-contain" />
              </div>
            )}

            {/* Manual Secret Key */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <span className="font-mono text-[11px] text-slate-400 truncate max-w-[240px]">{mfaSecret}</span>
              <button
                onClick={copySecretToClipboard}
                className="text-emerald-500 hover:text-emerald-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Verification OTP Box */}
            <div className="pt-2">
              <label className="block text-xs font-bold mb-2 text-slate-300">Enter the 6-digit code generated in your app:</label>
              <div className="flex items-center justify-center gap-2" onPaste={handlePasteOtp}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 h-12 text-center text-lg font-black rounded-xl border border-slate-800 bg-slate-950 text-emerald-400 focus:border-emerald-500 focus:outline-none"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => verifyMfaCode(otpDigits.join(''))}
              disabled={isLoading || otpDigits.some(d => d === '')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer mt-2"
            >
              Confirm Pairing & Complete Sign In
            </button>
          </div>
        )}

        {/* STEP 4: EMERGENCY BACKUP RECOVERY CODE */}
        {authStep === 'BACKUP_CODE' && (
          <form onSubmit={handleVerifyBackupCode} className="space-y-4 animate-fade-in">
            <div className="text-center">
              <h2 className="text-sm font-extrabold text-slate-100">Emergency Recovery Code</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter one of your 8-digit single-use backup recovery codes (e.g. <code>1234-5678</code>).
              </p>
            </div>

            <input
              type="text"
              required
              placeholder="XXXX-XXXX"
              value={backupCodeInput}
              onChange={(e) => setBackupCodeInput(e.target.value)}
              className="w-full rounded-2xl py-3 px-4 text-center font-mono text-base tracking-widest bg-slate-950 border border-slate-800 text-emerald-400 focus:border-emerald-500 focus:outline-none"
            />

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-lg cursor-pointer"
            >
              Verify Backup Code & Sign In
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthStep('MFA_VERIFY')}
                className="text-xs text-slate-400 hover:text-slate-200 font-medium cursor-pointer"
              >
                Return to 6-digit Authenticator
              </button>
            </div>
          </form>
        )}

        {/* Security Footer Details */}
        <div className={`mt-6 pt-5 border-t flex items-center justify-between text-[11px] ${
          theme === 'dark' ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}>
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>RFC 6238 TOTP Secure</span>
          </div>
          <span className="font-medium">Offline Encrypted Vault</span>
        </div>
      </div>
    </div>
  );
};
