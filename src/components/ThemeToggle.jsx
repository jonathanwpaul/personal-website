'use client'
import { useEffect, useMemo, useState } from 'react'

function getSystemPrefersDark() {
  if (typeof window === 'undefined') return null
  return (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function applyThemeAttr(theme /* 'light' | 'dark' | null */) {
  const root = document.documentElement
  if (!root) return
  if (theme === 'light' || theme === 'dark') {
    root.setAttribute('data-theme', theme)
  } else {
    root.removeAttribute('data-theme') // fall back to system
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

  const baseClasses =
    'inline-flex items-center gap-2 rounded-md bg-background/80 px-3 py-2 text-sm font-medium text-text'
  const posClasses = fixed ? 'fixed top-4 right-4 z-50' : ''

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) return null

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={
        effectiveTheme === 'dark'
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      }
      className={`${posClasses} ${baseClasses} ${className}`}
    >
      {effectiveTheme === 'dark' ? (
        <span aria-hidden suppressHydrationWarning>🌙</span>
      ) : (
        <span aria-hidden suppressHydrationWarning>☀️</span>
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
