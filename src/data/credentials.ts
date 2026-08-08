/**
 * Credential + access-request store for the Login flow.
 *
 * Two modes, mirroring the rest of the data layer (src/data/repository.ts):
 *  - Backend configured (Google Sheets via Apps Script): passwords are
 *    verified and set server-side; the browser never sees a stored hash.
 *    Access requests are rows in the AccessRequests tab.
 *  - Standalone demo (no backend): passwords are salted-SHA256 hashed in the
 *    browser and kept in localStorage; access requests live in localStorage.
 *
 * `login` returns a structured reason so the Login page can show the right
 * message (wrong password vs. account has no password yet vs. disabled).
 */

import { authRequest, createRow, isConfigured, listRows, updateRow } from '../lib/sheetsClient'
import { hashPassword, randomSalt, verifyPassword } from '../lib/passwordHash'
import type { AccessRequest, User } from '../types/access'
import { DEMO_CREDENTIALS } from './users'

const CRED_KEY = 'bestcast.credentials'
const REQ_KEY = 'bestcast.accessRequests'
// Versioned: bump when the seeded DEMO_CREDENTIALS change so existing browsers
// pick up new/updated demo logins on next load.
const SEED_FLAG = 'bestcast.credentials.seeded.v2'

type CredStore = Record<string, { salt: string; hash: string }>

export type LoginReason = 'unknown-user' | 'invalid' | 'no-password' | 'disabled' | 'error'

export interface LoginResult {
  ok: boolean
  reason?: LoginReason
}

// ---------------------------------------------------------------------------
// localStorage helpers (demo mode)
// ---------------------------------------------------------------------------

function readCreds(): CredStore {
  try {
    return JSON.parse(window.localStorage.getItem(CRED_KEY) ?? '{}') as CredStore
  } catch {
    return {}
  }
}

function writeCreds(store: CredStore) {
  window.localStorage.setItem(CRED_KEY, JSON.stringify(store))
}

function readRequests(): AccessRequest[] {
  try {
    return JSON.parse(window.localStorage.getItem(REQ_KEY) ?? '[]') as AccessRequest[]
  } catch {
    return []
  }
}

function writeRequests(requests: AccessRequest[]) {
  window.localStorage.setItem(REQ_KEY, JSON.stringify(requests))
}

// ---------------------------------------------------------------------------
// Seeding (demo mode only)
// ---------------------------------------------------------------------------

/**
 * Seed the demo admin's password once, so the standalone app is usable
 * without a backend. No-op when a backend is configured (real credentials
 * live in the sheet) or after the first run.
 */
export async function ensureSeeded(): Promise<void> {
  if (isConfigured()) return
  if (window.localStorage.getItem(SEED_FLAG)) return
  const store = readCreds()
  for (const { userId, password } of DEMO_CREDENTIALS) {
    if (store[userId]) continue
    const salt = randomSalt()
    store[userId] = { salt, hash: await hashPassword(password, salt) }
  }
  writeCreds(store)
  window.localStorage.setItem(SEED_FLAG, '1')
}

/** Demo mode: whether this login handle already has a password set. */
export function hasLocalCredential(userId: string): boolean {
  return Boolean(readCreds()[userId])
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(user: User, password: string): Promise<LoginResult> {
  if (user.status === 'disabled') return { ok: false, reason: 'disabled' }

  if (isConfigured()) {
    try {
      const res = (await authRequest('login', { userId: user.userId, password })) as {
        ok?: boolean
        reason?: LoginReason
      }
      return res.ok ? { ok: true } : { ok: false, reason: res.reason ?? 'invalid' }
    } catch {
      return { ok: false, reason: 'error' }
    }
  }

  const cred = readCreds()[user.userId]
  if (!cred) return { ok: false, reason: 'no-password' }
  const ok = await verifyPassword(password, cred.salt, cred.hash)
  return ok ? { ok: true } : { ok: false, reason: 'invalid' }
}

/**
 * Set (or reset) a user's password. Used both for a first-time invited
 * account and for a self-service reset. Server-side in backend mode; local
 * hash in demo mode.
 */
export async function setPassword(user: User, password: string): Promise<void> {
  if (isConfigured()) {
    await authRequest('setPassword', { userId: user.userId, password })
    return
  }
  const store = readCreds()
  const salt = randomSalt()
  store[user.userId] = { salt, hash: await hashPassword(password, salt) }
  writeCreds(store)
}

// ---------------------------------------------------------------------------
// Access requests ("Request for Access")
// ---------------------------------------------------------------------------

export async function listAccessRequests(): Promise<AccessRequest[]> {
  if (!isConfigured()) return readRequests()
  try {
    return await listRows<AccessRequest>('AccessRequests')
  } catch {
    return readRequests()
  }
}

export async function createAccessRequest(
  input: Pick<AccessRequest, 'name' | 'email' | 'requestedRole' | 'note'>,
): Promise<AccessRequest> {
  const request: AccessRequest = {
    id: `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name,
    email: input.email,
    requestedRole: input.requestedRole,
    note: input.note,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  if (isConfigured()) {
    await createRow('AccessRequests', request)
  } else {
    writeRequests([request, ...readRequests()])
  }
  return request
}

export async function updateAccessRequestStatus(id: string, status: AccessRequest['status']): Promise<void> {
  if (isConfigured()) {
    await updateRow('AccessRequests', id, { status })
    return
  }
  writeRequests(readRequests().map((r) => (r.id === id ? { ...r, status } : r)))
}
