import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function applyTheme(next: 'light' | 'dark') {
  const root = document.documentElement
  // Ensure we never end up with both classes.
  root.classList.remove('dark', 'light')
  root.classList.add(next)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useLayoutEffect(() => {
    const saved = localStorage.getItem('studyai-theme') as 'light' | 'dark' | null
    const next = saved ?? 'dark'
    setTheme(next)
    applyTheme(next)
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('studyai-theme', next)
      applyTheme(next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
