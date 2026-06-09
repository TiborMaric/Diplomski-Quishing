/**
 * Cryptographic helpers for PII handling in the Quishing campaign.
 *
 * Two derived keys, both rooted in PROJECT_SALT (.env.local):
 *
 *   hash key = sha256("hash:" || PROJECT_SALT)   used for HMAC pseudonyms
 *   enc  key = sha256("enc:"  || PROJECT_SALT)   used for AES-256-GCM
 *
 * The hash is HMAC-SHA256 (deterministic — lets us count distinct
 * submitters across rows). Encryption is AES-256-GCM with a random 12-byte
 * IV per call, so the same plaintext produces a different ciphertext every
 * time. Output layout is `IV(12) || ciphertext || authTag(16)`.
 *
 * Decryption verifies the auth tag and throws on tampering.
 */

import {
  createHash,
  createHmac,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

function getSalt(): string {
  const salt = process.env.PROJECT_SALT;
  if (!salt || salt.length < 16) {
    throw new Error(
      "PROJECT_SALT is missing or too short. Set it in .env.local — at least 16 chars (try `openssl rand -base64 32`)."
    );
  }
  return salt;
}

function hashKey(): Buffer {
  return createHash("sha256").update("hash:" + getSalt()).digest();
}

function encKey(): Buffer {
  return createHash("sha256").update("enc:" + getSalt()).digest();
}

/**
 * Deterministic pseudonym for a (first, last) name pair.
 * Croatian-aware lowercasing, trim, then HMAC-SHA256 → hex string.
 */
export function hashFullName(first: string, last: string): string {
  const normFirst = first.trim().toLocaleLowerCase("hr");
  const normLast = last.trim().toLocaleLowerCase("hr");
  const message = `${normFirst}|${normLast}`;
  return createHmac("sha256", hashKey()).update(message, "utf8").digest("hex");
}

/**
 * AES-256-GCM with random IV. Output is `IV(12) || ciphertext || authTag(16)`
 * as a single Buffer.
 */
export function encryptString(plaintext: string): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, ct, tag]);
}

/**
 * Inverse of `encryptString`. Accepts a Buffer or a hex string (with or
 * without the leading `\x` that PostgREST returns for `bytea` columns).
 *
 * Throws on auth-tag mismatch, blob too short, or wrong key.
 */
export function decryptString(input: Buffer | string): string {
  let buf: Buffer;
  if (typeof input === "string") {
    const hex = input.startsWith("\\x") ? input.slice(2) : input;
    buf = Buffer.from(hex, "hex");
  } else {
    buf = input;
  }
  if (buf.length < 12 + 16) {
    throw new Error("Encrypted blob too short to contain IV + tag.");
  }
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(buf.length - 16);
  const ct = buf.subarray(12, buf.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", encKey(), iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}

/**
 * Convert a Buffer to the `\x...` hex string that Postgres `bytea` accepts
 * over PostgREST without manual base64 wrangling.
 */
export function toBytea(buf: Buffer): string {
  return "\\x" + buf.toString("hex");
}
