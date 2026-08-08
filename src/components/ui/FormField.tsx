import { PenLine, Paperclip } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'time'
  | 'email'
  | 'select'
  | 'status'
  | 'user'
  | 'boolean'
  | 'signature'
  | 'attachment'

export interface SelectOption {
  value: string
  label: string
}

interface FormFieldProps {
  label: string
  type?: FieldType
  value: string | number | boolean
  onChange: (value: string | number | boolean) => void
  options?: SelectOption[]
  required?: boolean
  help?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  suffix?: ReactNode
  span?: 1 | 2
}

const UNASSIGNED = '__unassigned__'

export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  options = [],
  required,
  help,
  placeholder,
  disabled,
  readOnly,
  suffix,
  span = 1,
}: FormFieldProps) {
  const isReadOnly = disabled || readOnly

  return (
    <div className={cn(span === 2 || type === 'textarea' || type === 'signature' ? 'sm:col-span-2' : '', isReadOnly && 'opacity-60')}>
      <label className="label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>

      {(type === 'text' || type === 'number' || type === 'date' || type === 'time' || type === 'email') && (
        <div className="relative">
          <input
            className="input"
            type={type}
            value={value as string | number}
            placeholder={placeholder}
            disabled={isReadOnly}
            onChange={(e) => onChange(type === 'number' ? e.target.valueAsNumber || 0 : e.target.value)}
          />
          {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">{suffix}</span>}
        </div>
      )}

      {type === 'textarea' && (
        <textarea
          className="textarea min-h-[80px]"
          value={value as string}
          placeholder={placeholder}
          disabled={isReadOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {(type === 'select' || type === 'status') && (
        <select
          className="select"
          value={value as string}
          disabled={isReadOnly}
          onChange={(e) => onChange(e.target.value)}
        >
          {!required && <option value="">— Select —</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {type === 'user' && (
        <select
          className="select"
          value={(value as string) || UNASSIGNED}
          disabled={isReadOnly}
          onChange={(e) => onChange(e.target.value === UNASSIGNED ? '' : e.target.value)}
        >
          <option value={UNASSIGNED}>— Unassigned —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {type === 'boolean' && (
        <label className="flex h-[34px] items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            checked={value as boolean}
            disabled={isReadOnly}
            onChange={(e) => onChange(e.target.checked)}
          />
          {placeholder ?? 'Yes'}
        </label>
      )}

      {type === 'signature' && (
        <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-surface-2 px-3 py-2">
          <PenLine className="h-4 w-4 shrink-0 text-muted" />
          <input
            className="input border-none bg-transparent px-0 focus:ring-0"
            placeholder="Type name to e-sign"
            value={value as string}
            disabled={isReadOnly}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}

      {type === 'attachment' && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5">
          <Paperclip className="h-4 w-4 shrink-0 text-muted" />
          <input
            className="input border-none bg-transparent px-0 focus:ring-0"
            placeholder="Paste a file / Drive URL"
            value={value as string}
            disabled={isReadOnly}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}

      {help && <p className="mt-0.5 text-[11px] text-muted">{help}</p>}
    </div>
  )
}
