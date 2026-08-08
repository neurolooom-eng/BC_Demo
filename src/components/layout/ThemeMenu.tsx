import { Check, Palette } from 'lucide-react'
import { useState } from 'react'
import { THEMES, useTheme } from '../../context/ThemeContext'

export function ThemeMenu() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost"
        title="Change theme"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Theme</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-border bg-surface p-2 shadow-card">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-2"
              >
                <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-border" style={{ backgroundColor: t.swatch }} />
                <span className="flex-1 text-text">{t.label}</span>
                <span className="text-[10px] uppercase text-muted">{t.mode}</span>
                {theme === t.id && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
