import { RefreshCw } from 'lucide-react'

/**
 * Forces a fresh copy of the app instead of whatever the browser has
 * cached - useful right after a new GitHub Pages deploy. Clears the Cache
 * Storage API (if anything's in it) before reloading; browsers no longer
 * expose a true cache-bypassing reload from JS, so this is the strongest
 * "hard refresh" available client-side.
 */
export function HardRefreshButton() {
  async function hardRefresh() {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={hardRefresh}
      className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-text"
      title="Hard refresh (clear cache & reload)"
      aria-label="Hard refresh"
    >
      <RefreshCw className="h-4 w-4" />
    </button>
  )
}
