import { db } from '../db';
import type { AuditLogEntry, Project, Framework, VerificationStamp } from '../types';

/**
 * Universal Pure JS SHA-256 fallback implementation
 */
function pureJsSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const maxWord = Math.pow(2, 32);
  const result: number[] = [];
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash = [
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

  let i: number;
  let j: number;

  for (i = 0; i < ascii.length; i++) {
    const jWord = i >> 2;
    words[jWord] = (words[jWord] || 0) | ((ascii.charCodeAt(i) & 0xff) << (8 * (3 - (i % 4))));
  }

  const jWordEnd = (asciiBitLength + 64 >> 9 << 4) + 14;
  words[ascii.length >> 2] = (words[ascii.length >> 2] || 0) | (0x80 << (8 * (3 - (ascii.length % 4))));
  words[jWordEnd + 1] = asciiBitLength;

  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = [...hash];

    for (j = 16; j < 64; j++) {
      const s0 = rightRotate(w[j - 15] || 0, 7) ^ rightRotate(w[j - 15] || 0, 18) ^ ((w[j - 15] || 0) >>> 3);
      const s1 = rightRotate(w[j - 2] || 0, 17) ^ rightRotate(w[j - 2] || 0, 19) ^ ((w[j - 2] || 0) >>> 10);
      w[j] = (((w[j - 16] || 0) + s0 + (w[j - 7] || 0) + s1) % maxWord) | 0;
    }

    let a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    for (j = 0; j < 64; j++) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + s1 + ch + (k[j] || 0) + (w[j] || 0)) % maxWord;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) % maxWord;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) % maxWord;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) % maxWord;
    }

    hash[0] = (hash[0] + a) % maxWord;
    hash[1] = (hash[1] + b) % maxWord;
    hash[2] = (hash[2] + c) % maxWord;
    hash[3] = (hash[3] + d) % maxWord;
    hash[4] = (hash[4] + e) % maxWord;
    hash[5] = (hash[5] + f) % maxWord;
    hash[6] = (hash[6] + g) % maxWord;
    hash[7] = (hash[7] + h) % maxWord;
  }

  for (i = 0; i < hash.length; i++) {
    for (j = 3; j >= 0; j--) {
      const bVal = (hash[i] >> (8 * j)) & 0xff;
      result.push(bVal);
    }
  }

  return result.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function computeSha256(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
    try {
      const enc = new TextEncoder();
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', enc.encode(data));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }
  return pureJsSha256(data);
}

/**
 * Records an immutable audit log entry into the cryptographic chain
 */
export async function recordAuditLog(
  projectId: string,
  action: AuditLogEntry['action'],
  actorName: string,
  actorEmail: string,
  details: string,
  frameworkId?: string
): Promise<AuditLogEntry> {
  const existingLogs = await db.auditLogs.where('projectId').equals(projectId).sortBy('sequenceNumber');
  const sequenceNumber = existingLogs.length + 1;
  const previousHash = existingLogs.length > 0 
    ? existingLogs[existingLogs.length - 1].hash 
    : '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis block hash

  const timestamp = new Date().toISOString();
  const payloadToHash = `${sequenceNumber}|${projectId}|${frameworkId || ''}|${action}|${actorEmail}|${timestamp}|${details}|${previousHash}`;
  const hash = await computeSha256(payloadToHash);

  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    projectId,
    frameworkId,
    action,
    actorName,
    actorEmail,
    timestamp,
    details,
    previousHash,
    hash,
    sequenceNumber
  };

  await db.auditLogs.put(entry);
  return entry;
}

/**
 * Validates the cryptographic integrity of the entire audit chain
 */
export async function verifyAuditLogChain(projectId: string): Promise<{
  isValid: boolean;
  totalBlocks: number;
  corruptedBlock?: number;
  details: string;
}> {
  const logs = await db.auditLogs.where('projectId').equals(projectId).sortBy('sequenceNumber');
  if (logs.length === 0) {
    return { isValid: true, totalBlocks: 0, details: 'Chain initialized (Genesis state).' };
  }

  let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < logs.length; i++) {
    const block = logs[i];
    if (block.previousHash !== expectedPrevHash) {
      return {
        isValid: false,
        totalBlocks: logs.length,
        corruptedBlock: block.sequenceNumber,
        details: `Cryptographic break at Block #${block.sequenceNumber}. Previous hash mismatch!`
      };
    }

    const payload = `${block.sequenceNumber}|${block.projectId}|${block.frameworkId || ''}|${block.action}|${block.actorEmail}|${block.timestamp}|${block.details}|${block.previousHash}`;
    const calculatedHash = await computeSha256(payload);

    if (calculatedHash !== block.hash) {
      return {
        isValid: false,
        totalBlocks: logs.length,
        corruptedBlock: block.sequenceNumber,
        details: `Tamper detected at Block #${block.sequenceNumber}. Hash integrity check failed!`
      };
    }

    expectedPrevHash = block.hash;
  }

  return {
    isValid: true,
    totalBlocks: logs.length,
    details: `All ${logs.length} cryptographic audit blocks verified 100% authentic and unbroken.`
  };
}

/**
 * Generates an official SHA-256 Digital Verification Stamp for Audit Reports
 */
export async function generateVerificationStamp(
  project: Project,
  framework: Framework,
  complianceScore: number,
  generatedBy: string
): Promise<VerificationStamp> {
  const reportId = `ANMAT-REP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const timestamp = new Date().toISOString();
  
  const payload = `${reportId}|${project.organizationName}|${framework.code}|${complianceScore}%|${generatedBy}|${timestamp}|ANMAT_SECURE_VAULT_V1`;
  const sha256Hash = await computeSha256(payload);
  const signatureCert = `CERT-SA-${sha256Hash.substring(0, 16).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  return {
    reportId,
    organizationName: project.organizationName,
    frameworkCode: framework.code,
    complianceScore,
    generatedBy,
    timestamp,
    sha256Hash,
    signatureCert
  };
}
