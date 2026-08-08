/**
 * Root-absolute paths like "/logo.png" only work when the app is served
 * from a domain root - GitHub Pages serves this project from "/Bestcast/",
 * so they 404 there. Prefix public/ asset paths with the configured base
 * instead (import.meta.env.BASE_URL, set from vite.config.ts's `base`).
 */
export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
