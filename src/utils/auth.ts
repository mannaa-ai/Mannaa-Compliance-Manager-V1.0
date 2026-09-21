import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import type { UserAccount, UserRole } from '../types';

export const ROLE_LABELS: Record<UserRole, { en: string; ar: string; desc: string }> = {
  ADMIN: {
    en: 'System Administrator',
    ar: 'مدير النظام الكامل',
    desc: 'Full administrative access to manage users, frameworks, and settings.'
  },
  LEAD_AUDITOR: {
    en: 'Lead Auditor',
    ar: 'كبير المدققين والمقيّمين',
    desc: 'Full access to evaluate controls, approve scores, and generate reports.'
  },
  COMPLIANCE_ASSESSOR: {
    en: 'Compliance Assessor',
    ar: 'مقيّم امتثال ورقابة',
    desc: 'Can perform assessments, record findings, and define remediation plans.'
  },
  EVIDENCE_CONTRIBUTOR: {
    en: 'Evidence Contributor',
    ar: 'مسؤول جمع ورفع الأدلة',
    desc: 'Can upload and link evidence documents and operational policies.'
  },
  AUDITOR_OBSERVER: {
    en: 'Auditor Observer (Read-Only)',
    ar: 'مراقب تدقيق / إدارة عليا (قراءة فقط)',
    desc: 'Read-only access to view dashboards, analytics, and export reports.'
  }
};

// Cryptographic hash using standard Web Crypto API (SHA-256 with Salt)
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:ANMAT_COMPLIANCE_PEPPER_2026`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateMfaSecret(): string {
  return generateSecret();
}

export function generateTotpUri(email: string, secret: string, issuer = 'ANMAT Compliance Manager'): string {
  return generateURI({ secret, label: email, issuer });
}

export async function generateQrCodeDataUrl(otpAuthUri: string): Promise<string> {
  return await QRCode.toDataURL(otpAuthUri, {
    width: 240,
    margin: 1.5,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });
}

export function verifyTotpToken(token: string, secret: string): boolean {
  try {
    const res = verifySync({ token: token.trim(), secret });
    return Boolean(res && res.valid);
  } catch {
    return false;
  }
}

export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const p1 = Math.floor(1000 + Math.random() * 9000);
    const p2 = Math.floor(1000 + Math.random() * 9000);
    codes.push(`${p1}-${p2}`);
  }
  return codes;
}

// User accounts store in localStorage
const USERS_STORAGE_KEY = 'anmat_user_accounts_vault';

export async function getStoredUsers(): Promise<UserAccount[]> {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  // Initialize default Admin & Lead Auditor accounts if none exist
  const adminSalt = generateSalt();
  const adminHash = await hashPassword('AnmatCompliance2026!', adminSalt);
  const adminSecret = generateMfaSecret();

  const auditorSalt = generateSalt();
  const auditorHash = await hashPassword('AnmatCompliance2026!', auditorSalt);
  const auditorSecret = generateMfaSecret();

  const defaultUsers: UserAccount[] = [
    {
      email: 'auditor@anmat.sa',
      name: 'Mohamed Ali',
      role: 'ADMIN',
      passwordHash: adminHash,
      salt: adminSalt,
      mfaSecret: adminSecret,
      mfaEnabled: false,
      backupCodes: generateBackupCodes(),
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      email: 'assessor@anmat.sa',
      name: 'GRC Assessor',
      role: 'COMPLIANCE_ASSESSOR',
      passwordHash: auditorHash,
      salt: auditorSalt,
      mfaSecret: auditorSecret,
      mfaEnabled: false,
      backupCodes: generateBackupCodes(),
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ];

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

export function saveStoredUsers(users: UserAccount[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export async function createUserAccount(
  email: string,
  name: string,
  role: UserRole,
  initialPassword: string
): Promise<UserAccount> {
  const users = await getStoredUsers();
  if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    throw new Error('A user with this email address already exists.');
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(initialPassword, salt);
  const mfaSecret = generateMfaSecret();
  const backupCodes = generateBackupCodes();

  const newUser: UserAccount = {
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role,
    passwordHash,
    salt,
    mfaSecret,
    mfaEnabled: false,
    backupCodes,
    createdAt: new Date().toISOString(),
    isActive: true
  };

  users.push(newUser);
  saveStoredUsers(users);
  return newUser;
}
