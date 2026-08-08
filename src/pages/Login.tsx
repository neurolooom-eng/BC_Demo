import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, LogIn, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Logo } from '../components/layout/Logo'
import { Button } from '../components/ui/Button'
import { useAccess } from '../context/AccessContext'
import {
  createAccessRequest,
  login as loginRequest,
  setPassword as setPasswordRequest,
  type LoginReason,
} from '../data/credentials'
import { DEMO_ADMIN_PASSWORD, DEMO_ADMIN_USER_ID } from '../data/users'
import { isConfigured } from '../lib/sheetsClient'

type Mode = 'signin' | 'reset' | 'request'

const MIN_PASSWORD_LENGTH = 8

const LOGIN_MESSAGES: Record<LoginReason, string> = {
  'unknown-user': 'No account found with that User ID. Check with your administrator.',
  invalid: 'Incorrect User ID or password.',
  'no-password': "This account has no password yet. Use “Set / Reset password” to create one.",
  disabled: 'This account has been disabled. Please contact your administrator.',
  error: "Couldn’t reach the sign-in service. Please try again.",
}

function findByUserId(users: ReturnType<typeof useAccess>['users'], userId: string) {
  const needle = userId.trim().toLowerCase()
  return users.find((u) => u.userId.toLowerCase() === needle)
}

export function Login() {
  const [mode, setMode] = useState<Mode>('signin')

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg px-4 py-10 text-text">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo />
          <div>
            <h1 className="text-lg font-bold text-text">Best Cast e-QMS</h1>
            <p className="text-sm text-muted">Quality Management System</p>
          </div>
        </div>

        <div className="card p-6">
          {mode === 'signin' && <SignInForm onSwitch={setMode} />}
          {mode === 'reset' && <ResetForm onSwitch={setMode} />}
          {mode === 'request' && <RequestAccessForm onSwitch={setMode} />}
        </div>

        {!isConfigured() && mode === 'signin' && (
          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
            Demo mode (no Google Sheet connected). Sign in as admin with User ID{' '}
            <span className="font-semibold text-text">{DEMO_ADMIN_USER_ID}</span> / password{' '}
            <span className="font-semibold text-text">{DEMO_ADMIN_PASSWORD}</span>. Other seeded users can set their own
            password via &ldquo;Set / Reset password&rdquo;.
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function Feedback({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  const isError = tone === 'error'
  const Icon = isError ? AlertCircle : CheckCircle2
  return (
    <div
      className={
        'mb-4 flex items-start gap-2 rounded-md border px-3 py-2 text-sm ' +
        (isError ? 'border-danger/30 bg-danger/10 text-danger' : 'border-success/30 bg-success/10 text-success')
      }
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

function SwitchLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="font-medium text-primary hover:underline">
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------

function SignInForm({ onSwitch }: { onSwitch: (mode: Mode) => void }) {
  const { users, signIn } = useAccess()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const user = findByUserId(users, userId)
    if (!user) {
      setError(LOGIN_MESSAGES['unknown-user'])
      return
    }
    setBusy(true)
    try {
      const result = await loginRequest(user, password)
      if (result.ok) {
        signIn(user.id)
      } else {
        setError(LOGIN_MESSAGES[result.reason ?? 'invalid'])
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-text">Sign in</h2>
        <p className="text-sm text-muted">Use the User ID your administrator issued.</p>
      </div>

      {error && <Feedback tone="error">{error}</Feedback>}

      <div>
        <label className="label" htmlFor="signin-userid">
          User ID
        </label>
        <input
          id="signin-userid"
          className="input"
          autoComplete="username"
          autoFocus
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="e.g. vikensh"
        />
      </div>

      <div>
        <label className="label" htmlFor="signin-password">
          Password
        </label>
        <input
          id="signin-password"
          className="input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />
      </div>

      <Button type="submit" icon={<LogIn className="h-4 w-4" />} className="w-full" disabled={busy || !userId || !password}>
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>

      <div className="flex items-center justify-between pt-1 text-sm">
        <SwitchLink onClick={() => onSwitch('reset')}>Set / Reset password</SwitchLink>
        <SwitchLink onClick={() => onSwitch('request')}>Request access</SwitchLink>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------

function ResetForm({ onSwitch }: { onSwitch: (mode: Mode) => void }) {
  const { users, saveUser, signIn } = useAccess()
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const user = findByUserId(users, userId)
    if (!user || user.email.toLowerCase() !== email.trim().toLowerCase()) {
      setError('User ID and email do not match an account. Check both, or request access.')
      return
    }
    if (user.status === 'disabled') {
      setError('This account has been disabled. Please contact your administrator.')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await setPasswordRequest(user, password)
      saveUser({ ...user, status: 'active' })
      signIn(user.id)
    } catch {
      setError("Couldn’t save your password. Please try again.")
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-text">Set or reset password</h2>
        <p className="text-sm text-muted">
          Verify your User ID and email, then choose a new password. First-time users set their password here too.
        </p>
      </div>

      {error && <Feedback tone="error">{error}</Feedback>}

      <div>
        <label className="label" htmlFor="reset-userid">
          User ID
        </label>
        <input id="reset-userid" className="input" autoFocus value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. vimal" />
      </div>

      <div>
        <label className="label" htmlFor="reset-email">
          Registered email
        </label>
        <input
          id="reset-email"
          className="input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@bestcastgroup.com"
        />
      </div>

      <div>
        <label className="label" htmlFor="reset-password">
          New password
        </label>
        <input
          id="reset-password"
          className="input"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        />
      </div>

      <div>
        <label className="label" htmlFor="reset-confirm">
          Confirm new password
        </label>
        <input
          id="reset-confirm"
          className="input"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter password"
        />
      </div>

      <Button type="submit" icon={<KeyRound className="h-4 w-4" />} className="w-full" disabled={busy}>
        {busy ? 'Saving…' : 'Save password & sign in'}
      </Button>

      <button type="button" onClick={() => onSwitch('signin')} className="flex items-center gap-1 pt-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------

function RequestAccessForm({ onSwitch }: { onSwitch: (mode: Mode) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [requestedRole, setRequestedRole] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !email.trim()) {
      setError('Please provide at least your name and email.')
      return
    }
    setBusy(true)
    try {
      await createAccessRequest({ name: name.trim(), email: email.trim(), requestedRole: requestedRole.trim(), note: note.trim() })
      setDone(true)
    } catch {
      setError("Couldn’t submit your request. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="space-y-4">
        <Feedback tone="success">
          Thanks! Your access request has been submitted. An administrator will review it and set up your account.
        </Feedback>
        <Button variant="outline" className="w-full" onClick={() => onSwitch('signin')}>
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-text">Request access</h2>
        <p className="text-sm text-muted">Tell us who you are. An administrator will create your account.</p>
      </div>

      {error && <Feedback tone="error">{error}</Feedback>}

      <div>
        <label className="label" htmlFor="req-name">
          Full name
        </label>
        <input id="req-name" className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>

      <div>
        <label className="label" htmlFor="req-email">
          Email
        </label>
        <input id="req-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@bestcastgroup.com" />
      </div>

      <div>
        <label className="label" htmlFor="req-role">
          Role / department requested
        </label>
        <input id="req-role" className="input" value={requestedRole} onChange={(e) => setRequestedRole(e.target.value)} placeholder="e.g. Shift Supervisor" />
      </div>

      <div>
        <label className="label" htmlFor="req-note">
          Note (optional)
        </label>
        <textarea id="req-note" className="textarea min-h-[70px]" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything the admin should know" />
      </div>

      <Button type="submit" icon={<UserPlus className="h-4 w-4" />} className="w-full" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit request'}
      </Button>

      <button type="button" onClick={() => onSwitch('signin')} className="flex items-center gap-1 pt-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </button>
    </form>
  )
}
