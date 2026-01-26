// Theme toggle hook
import { useState, useEffect } from 'react'

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hpl-theme') || 'hpl'
    }
    return 'hpl'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('hpl-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'hpl' ? 'hpldark' : 'hpl')
  }

  const isDark = theme === 'hpldark'

  return { theme, toggleTheme, isDark }
}

export default useTheme
