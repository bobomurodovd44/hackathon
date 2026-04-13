'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type FontSize = 'S' | 'M' | 'L'

interface FontSizeContextType {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined)

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  // Default to M initially to match standard 16px Tailwind sizing
  const [fontSize, setFontSizeState] = useState<FontSize>('M')

  useEffect(() => {
    // Try to load from localStorage on mount
    try {
      const stored = localStorage.getItem('fontSize') as FontSize | null
      if (stored && ['S', 'M', 'L'].includes(stored)) {
        setFontSizeState(stored)
        applyFontSize(stored)
      } else {
        applyFontSize('M')
      }
    } catch (e) {
      // Ignore localStorage errors (e.g., incognito mode)
    }
  }, [])

  const applyFontSize = (size: FontSize) => {
    let px = '16px' // default M
    if (size === 'S') px = '14px'
    if (size === 'L') px = '21px'
    
    document.documentElement.style.fontSize = px
  }

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size)
    applyFontSize(size)
    try {
      localStorage.setItem('fontSize', size)
    } catch (e) {}
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export function useFontSize() {
  const context = useContext(FontSizeContext)
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider')
  }
  return context
}
