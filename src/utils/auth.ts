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

// Pure JS SHA-256 implementation to guarantee 100% compatibility across HTTP, HTTPS, and older browsers
function sha256Pure(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let compositeClear = ascii + '\x80';
  while (compositeClear[lengthProperty] % 64 - 56) compositeClear += '\x00';
  for (i = 0; i < compositeClear[lengthProperty]; i++) {
    j = compositeClear.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] =
        i < 16
          ? w[i]
          : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const s1_ =
        rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 =
        (hash[7] + s1_ + ch + k[i] + w[i]) | 0;
      const s0_ =
        rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj =
        (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0_ + maj) | 0;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

// Universal Cryptographic hash: uses crypto.subtle if available (HTTPS/localhost), otherwise pure JS fallback
export async function hashPassword(password: string, salt: string): Promise<string> {
  const payload = `${salt}:${password}:ANMAT_COMPLIANCE_PEPPER_2026`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(payload);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback to pure JS
    }
  }
  
  return sha256Pure(payload);
}

export function generateSalt(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Math.random fallback
  let salt = '';
  for (let i = 0; i < 32; i++) {
    salt += Math.floor(Math.random() * 16).toString(16);
  }
  return salt;
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
