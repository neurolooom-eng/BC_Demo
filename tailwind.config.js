/** @type {import('tailwindcss').Config} */
const v = (name) => ({ opacityValue }) =>
  opacityValue === undefined ? `rgb(var(${name}))` : `rgb(var(${name}) / ${opacityValue})`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('--c-bg'),
        surface: v('--c-surface'),
        'surface-2': v('--c-surface-2'),
        border: v('--c-border'),
        text: v('--c-text'),
        muted: v('--c-muted'),
        primary: v('--c-primary'),
        'primary-fg': v('--c-primary-fg'),
        accent: v('--c-accent'),
        success: v('--c-success'),
        warning: v('--c-warning'),
        danger: v('--c-danger'),
        info: v('--c-info'),
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px 0 rgb(0 0 0 / .04), 0 1px 3px 0 rgb(0 0 0 / .06)' },
    },
  },
  plugins: [],
}
