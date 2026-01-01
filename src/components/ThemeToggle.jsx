'use client'
import { useEffect, useMemo, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

function getSystemPrefersDark() {
  if (typeof window === 'undefined') return null
  return (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

// Apply theme by toggling the `dark` class on <html> and optionally a data-theme attribute.
// theme: 'light' | 'dark' | null (null = follow system preference)
function applyThemeAttr(theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (!root) return

  const prefersDark = getSystemPrefersDark()

  if (theme === 'dark') {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
  } else {
    // Follow system preference when theme is null
    root.setAttribute('data-theme', 'system')
    if (prefersDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }
}

export default function ThemeToggle({ className = '', fixed = false }) {
  // null => system, 'light' | 'dark' => forced
  const [theme, setTheme] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // initialize from localStorage (if present)
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved)
        applyThemeAttr(saved)
        return
      }
    } catch {}
    // otherwise follow system (no data-theme attr)
    applyThemeAttr(null)
  }, [])

  // Re-apply on change
  useEffect(() => {
    if (!mounted) return
    applyThemeAttr(theme)
    try {
      if (theme === null) localStorage.removeItem('theme')
      else localStorage.setItem('theme', theme)
    } catch {}
  }, [theme, mounted])

  const effectiveTheme = useMemo(() => {
    if (!mounted) return 'light' // render stable on SSR; replaced after mount
    if (theme) return theme
    const sys = getSystemPrefersDark()
    return sys ? 'dark' : 'light'
  }, [theme, mounted])

  function toggleTheme() {
    if (!mounted) return
    // if currently following system (theme === null), flip to the opposite of system and persist
    if (theme === null) {
      const next = getSystemPrefersDark() ? 'light' : 'dark'
      setTheme(next)
      return
    }
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const posClasses = fixed ? 'fixed top-4 right-4 z-50' : ''

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) return null

  const isDark = effectiveTheme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`${posClasses} ${className}`}
    >
      <div className="inline-flex items-center">
        {/* Track */}
        <div className="relative flex items-center h-7 w-[3rem] rounded-full border border-border bg-background/80 shadow-sm transition-colors px-1">
          {/* Thumb */}
          <div
            className={`pointer-events-none absolute h-5 w-5 rounded-full bg-primary/80 shadow-sm transition-transform ${
              isDark ? 'translate-x-[1rem]' : 'translate-x-0'
            }`}
            aria-hidden
          />
          {/* Icons laid out with flex for even spacing */}
          <div className="relative z-10 flex w-full items-center">
            <Sun
              className={`pointer-events-none h-3 w-3 flex-1 transition-colors ${
                isDark ? 'text-muted-foreground' : 'text-primary'
              }`}
              aria-hidden
            />
            <Moon
              className={`pointer-events-none h-3 w-3 flex-1 transition-colors ${
                isDark ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-hidden
            />
          </div>
        </div>
        <span className="sr-only">Toggle theme</span>
      </div>
    </button>
  )
}
