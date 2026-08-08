/**
 * Salted SHA-256 password hashing for the standalone (no-backend) demo mode.
 *
 * The scheme is intentionally identical to the Apps Script backend
 * (google-apps-script/Code.gs -> hashPassword_): the stored hash is the
 * lowercase hex SHA-256 of `${salt}:${password}`. That way a password set
 * while offline verifies the same way once a Google Sheets backend is wired
 * up, and vice versa.
 *
 * NOTE: a browser-side salted SHA-256 is fine for a demo but is NOT a
 * substitute for a real password KDF (bcrypt/scrypt/Argon2) behind a
 * trusted server. When this moves to Supabase, delegate auth to it.
 */

const encoder = new TextEncoder()

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function randomSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${salt}:${password}`))
  return toHex(digest)
}

/** Constant-ish time comparison of two equal-length hex strings. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const actual = await hashPassword(password, salt)
  return safeEqual(actual, expectedHash)
}
