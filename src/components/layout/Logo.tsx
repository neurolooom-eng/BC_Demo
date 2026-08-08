import { assetUrl } from '../../lib/assetUrl'

/**
 * The icon mark (cropped from the real Best Cast logo) is colorful enough to
 * read on any background, but the logo's "BEST CAST" wordmark is baked in as
 * dark navy pixels - illegible on the dark theme. So only the mark is an
 * <img>; the wordmark is real, theme-aware text approximating the logo's
 * serif typeface.
 */
export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  if (collapsed) {
    return <img src={assetUrl('/logo-mark.png')} alt="Best Cast" className="h-8 w-auto shrink-0" />
  }

  return (
    <div className="flex min-w-0 items-center gap-2 overflow-hidden">
      <img src={assetUrl('/logo-mark.png')} alt="Best Cast" className="h-7 w-auto shrink-0" />
      <div className="min-w-0 leading-tight">
        <p className="truncate font-serif text-base font-bold tracking-tight text-text">BEST CAST</p>
        <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-muted">e-QMS</p>
      </div>
    </div>
  )
}
