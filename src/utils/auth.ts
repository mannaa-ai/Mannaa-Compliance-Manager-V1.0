import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';

export interface AuthProfile {
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  salt: string;
  mfaSecret: string;
  mfaEnabled: boolean;
  backupCodes: string[];
  lastLogin?: string;
  failedAttempts: number;
  lockedUntil?: number;
}

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
