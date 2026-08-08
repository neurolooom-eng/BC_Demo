import { Check, Settings as SettingsIcon } from 'lucide-react'
import buildInfo from '../build-info.json'
import { Card } from '../components/ui/Card'
import { StatusChip } from '../components/ui/StatusChip'
import { useTheme, THEMES } from '../context/ThemeContext'
import { COMPANY, CORE_METHODOLOGIES, INDUSTRIES_SERVED, QUALITY_STANDARDS } from '../data/company'
import { assetUrl } from '../lib/assetUrl'

export function Settings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <SettingsIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Settings</h1>
          <p className="text-sm text-muted">Company profile, appearance and application information.</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center gap-4">
          <img src={assetUrl('/logo.png')} alt={COMPANY.brandName} className="h-10 w-auto" />
          <div>
            <p className="text-sm font-semibold text-text">{COMPANY.legalName}</p>
            <p className="text-xs text-muted">{COMPANY.domain}</p>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">Brand Name</dt>
            <dd className="text-text">{COMPANY.brandName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Industry</dt>
            <dd className="text-text">{COMPANY.industry}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Established</dt>
            <dd className="text-text tabular-nums">{COMPANY.established}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs text-muted">Primary Business</dt>
            <dd className="text-text">{COMPANY.primaryBusiness}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Headquarters</dt>
            <dd className="text-text">{COMPANY.headquarters}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Manufacturing Units</dt>
            <dd className="text-text tabular-nums">{COMPANY.manufacturingUnits}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Website</dt>
            <dd className="text-text">{COMPANY.website}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Email</dt>
            <dd className="text-text">{COMPANY.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Business Hours</dt>
            <dd className="text-text">{COMPANY.businessHours}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Managing Director</dt>
            <dd className="text-text">{COMPANY.managingDirector}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Founder</dt>
            <dd className="text-text">{COMPANY.founder}</dd>
          </div>
        </dl>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Applicable Standards & Methodologies</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Quality Management</p>
            <ul className="space-y-1.5">
              {QUALITY_STANDARDS.map((s) => (
                <li key={s.code} className="text-sm text-text">
                  <StatusChip value={s.code} tone="primary" /> <span className="text-muted">- {s.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Core Quality Methodologies</p>
            <div className="flex flex-wrap gap-1.5">
              {CORE_METHODOLOGIES.map((m) => (
                <span key={m.code} title={m.label}>
                  <StatusChip value={m.code} tone="info" />
                </span>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Industries Served</p>
            <div className="flex flex-wrap gap-1.5">
              {INDUSTRIES_SERVED.map((i) => (
                <StatusChip key={i} value={i} tone="success" />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Theme</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className="flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-surface-2"
            >
              <span className="h-8 w-8 shrink-0 rounded-full border border-border" style={{ backgroundColor: t.swatch }} />
              <div className="flex-1">
                <p className="text-sm font-medium text-text">{t.label}</p>
                <p className="text-[11px] uppercase text-muted">{t.mode}</p>
              </div>
              {theme === t.id && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Application Info</h2>
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
            <dt className="text-xs text-muted">Organisation</dt>
            <dd className="text-text">{COMPANY.legalName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Module</dt>
            <dd className="text-text">e-QMS</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
