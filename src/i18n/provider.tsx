'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { i18nService, SupportedLang } from './i18n-service'
import { dictionaries } from './dictionaries'

type TranslationContextType = {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  t: typeof dictionaries['ru']; // enforces structural typing for both dictionaries
}

const I18nContext = createContext<TranslationContextType | null>(null)

export function I18nProvider({ children, initialLang }: { children: React.ReactNode, initialLang?: SupportedLang }) {
  const [lang, setLangState] = useState<SupportedLang>(initialLang || 'ru')

  useEffect(() => {
    // If not forced by URL, use cached
    if (!initialLang) {
      setLangState(i18nService.getLang())
    }
  }, [initialLang])

  const handleSetLang = (newLang: SupportedLang) => {
    i18nService.setLang(newLang)
    setLangState(newLang)
  }

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t: dictionaries[lang] }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(I18nContext)
  if (!context) throw new Error("useTranslation must be used within I18nProvider")
  return context
}
