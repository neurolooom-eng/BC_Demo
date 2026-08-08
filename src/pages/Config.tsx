import { CheckCircle2, ExternalLink, RefreshCw, Wrench, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import buildInfo from '../build-info.json'
import * as sheets from '../lib/sheetsClient'
import { DEFAULT_TAB_NAMES, getEffectiveExecUrl, getRuntimeConfig, setRuntimeConfig, type RuntimeConfig } from '../lib/runtimeConfig'

const REPO_URL = 'https://github.com/neurolooom-eng/Bestcast'

type CheckResult = { status: 'idle' | 'checking' | 'ok' | 'error'; message?: string; count?: number }

const SHEET_KEYS = Object.keys(DEFAULT_TAB_NAMES) as (keyof typeof DEFAULT_TAB_NAMES)[]

export function Config() {
  const [form, setForm] = useState<RuntimeConfig>(getRuntimeConfig)
  const [saved, setSaved] = useState(false)
  const [checks, setChecks] = useState<Record<(typeof SHEET_KEYS)[number], CheckResult>>(
    Object.fromEntries(SHEET_KEYS.map((key) => [key, { status: 'idle' }])) as Record<(typeof SHEET_KEYS)[number], CheckResult>,
  )

  const envDefault = import.meta.env.VITE_SHEETS_API_URL
  const effectiveUrl = getEffectiveExecUrl()

  function save() {
    setRuntimeConfig(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function testConnection() {
    setRuntimeConfig(form)
    for (const key of SHEET_KEYS) {
      setChecks((prev) => ({ ...prev, [key]: { status: 'checking' } }))
      try {
        const rows = await sheets.listRows(key)
        setChecks((prev) => ({ ...prev, [key]: { status: 'ok', count: rows.length } }))
      } catch (err) {
        setChecks((prev) => ({ ...prev, [key]: { status: 'error', message: err instanceof Error ? err.message : String(err) } }))
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Developer Config</h1>
          <p className="text-sm text-muted">
            Wire up and verify the Google Sheets backend without a rebuild. Visible only to Developer /
            Administrator groups.
          </p>
        </div>
      </div>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Backend connection</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Apps Script Exec URL"
            span={2}
            value={form.execUrl}
            placeholder={envDefault || 'https://script.google.com/macros/s/XXXXXXXX/exec'}
            onChange={(v) => setForm({ ...form, execUrl: String(v) })}
            help="Overrides the build-time VITE_SHEETS_API_URL. Leave blank to use the build default shown as placeholder."
          />
          <FormField
            label="Spreadsheet ID (optional)"
            value={form.spreadsheetId}
            placeholder="Uses the script's bound spreadsheet if blank"
            onChange={(v) => setForm({ ...form, spreadsheetId: String(v) })}
            help="Only needed if one Apps Script deployment serves more than one spreadsheet."
          />
        </div>

        <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Sheet tab names</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SHEET_KEYS.map((key) => (
            <FormField
              key={key}
              label={key}
              value={form.tabNames[key]}
              placeholder={DEFAULT_TAB_NAMES[key]}
              onChange={(v) => setForm({ ...form, tabNames: { ...form.tabNames, [key]: String(v) } })}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={save}>Save</Button>
          <Button variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={testConnection}>
            Test Connection
          </Button>
          {saved && <span className="text-xs text-success">Saved to this browser.</span>}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Connection status</h2>
        <div className="space-y-2">
          {SHEET_KEYS.map((key) => {
            const check = checks[key]
            return (
              <div key={key} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                <span className="text-text">
                  {key} <span className="text-muted">({form.tabNames[key]})</span>
                </span>
                {check.status === 'idle' && <span className="text-xs text-muted">Not checked yet</span>}
                {check.status === 'checking' && <span className="text-xs text-muted">Checking…</span>}
                {check.status === 'ok' && (
                  <span className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> OK - {check.count} row{check.count === 1 ? '' : 's'}
                  </span>
                )}
                {check.status === 'error' && (
                  <span className="flex items-center gap-1 text-xs text-danger" title={check.message}>
                    <XCircle className="h-3.5 w-3.5" /> {check.message}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        {!effectiveUrl && (
          <p className="mt-3 text-xs text-muted">
            No exec URL configured yet (build-time or runtime) - the app is running entirely on bundled mock data.
          </p>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Deployment</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Build ID</dt>
            <dd className="tabular-nums text-text">#{buildInfo.buildId}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Built</dt>
            <dd className="text-text">{buildInfo.buildDate ? new Date(buildInfo.buildDate).toLocaleString() : '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Effective exec URL source</dt>
            <dd className="text-text">{form.execUrl ? 'Config page (this browser)' : envDefault ? 'Build-time env var' : 'None'}</dd>
          </div>
        </dl>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <a className="flex items-center gap-1 text-primary hover:underline" href={`${REPO_URL}/actions`} target="_blank" rel="noreferrer">
            GitHub Actions runs <ExternalLink className="h-3 w-3" />
          </a>
          <a className="flex items-center gap-1 text-primary hover:underline" href={`${REPO_URL}/settings/pages`} target="_blank" rel="noreferrer">
            Pages settings <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </Card>
    </div>
  )
}
