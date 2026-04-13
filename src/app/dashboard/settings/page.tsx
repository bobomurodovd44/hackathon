'use client'

import { useEffect, useState } from 'react'
import { Settings, Globe, Type, Sun, Moon, Monitor } from 'lucide-react'
import { useFontSize } from '@/contexts/font-size-provider'
import { useTranslation } from '@/i18n/provider'
import { SupportedLang } from '@/i18n/i18n-service'
import { client } from '@/lib/feathers'

export default function SettingsPage() {
  const { fontSize, setFontSize } = useFontSize()
  const { lang: currentLang, setLang, t } = useTranslation()
  const [theme, setThemeState] = useState('system')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'system'
    setThemeState(saved)
    client.reAuthenticate().then((res) => setUser(res.user)).catch(() => {})
  }, [])

  const setTheme = (nextTheme: string) => {
    setThemeState(nextTheme)
    localStorage.setItem('theme', nextTheme)
    const root = document.documentElement
    if (nextTheme === 'dark') {
      root.classList.add('dark')
    } else if (nextTheme === 'light') {
      root.classList.remove('dark')
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  const fontSizes = [
    { key: 'S' as const, label: t.dashboard.settings.fontSmall, desc: t.dashboard.settings.fontSmallDesc },
    { key: 'M' as const, label: t.dashboard.settings.fontMedium, desc: t.dashboard.settings.fontMediumDesc },
    { key: 'L' as const, label: t.dashboard.settings.fontLarge, desc: t.dashboard.settings.fontLargeDesc },
  ]

  const themes = [
    { key: 'light', label: t.dashboard.settings.themeLight, icon: Sun },
    { key: 'dark', label: t.dashboard.settings.themeDark, icon: Moon },
    { key: 'system', label: t.dashboard.settings.themeSystem, icon: Monitor },
  ]

  const languages: { key: SupportedLang; label: string; flag: string }[] = [
    { key: 'uz', label: t.dashboard.settings.languages.uz, flag: '/uz.svg' },
    { key: 'ru', label: t.dashboard.settings.languages.ru, flag: '/ru.svg' },
  ]

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-mono font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-[#eb6e4b]" />
          {t.dashboard.settings.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.dashboard.settings.subtitle}
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Type className="w-5 h-5 text-[#eb6e4b]" />
          <h2 className="text-xl font-mono font-bold text-gray-900 dark:text-white">{t.dashboard.settings.fontSize}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {fontSizes.map((size) => (
            <button
              key={size.key}
              onClick={() => setFontSize(size.key)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                fontSize === size.key
                  ? 'border-[#eb6e4b] bg-[#eb6e4b]/5 shadow-md'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <span className="block font-mono font-bold text-lg text-gray-900 dark:text-white">{size.label}</span>
              <span className="block text-xs text-gray-500 mt-1">{size.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Sun className="w-5 h-5 text-[#eb6e4b]" />
          <h2 className="text-xl font-mono font-bold text-gray-900 dark:text-white">{t.dashboard.settings.theme}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((themeItem) => (
            <button
              key={themeItem.key}
              onClick={() => setTheme(themeItem.key)}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                theme === themeItem.key
                  ? 'border-[#eb6e4b] bg-[#eb6e4b]/5 shadow-md'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <themeItem.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-mono font-bold text-gray-900 dark:text-white">{themeItem.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-[#eb6e4b]" />
          <h2 className="text-xl font-mono font-bold text-gray-900 dark:text-white">{t.dashboard.settings.language}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.key}
              onClick={() => setLang(lang.key)}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                currentLang === lang.key
                  ? 'border-[#eb6e4b] bg-[#eb6e4b]/5 shadow-md'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <img src={lang.flag} className="w-8 h-8 rounded-full object-cover" alt={lang.label} />
              <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">{lang.label}</span>
            </button>
          ))}
        </div>
      </section>

      {user && (
        <section className="space-y-4">
          <h2 className="text-xl font-mono font-bold text-gray-900 dark:text-white">{t.dashboard.settings.account}</h2>
          <div className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">{t.dashboard.settings.firstName}</span>
              <span className="font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">{t.dashboard.settings.email}</span>
              <span className="font-bold text-gray-900 dark:text-white">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">{t.dashboard.settings.role}</span>
              <span className="font-bold text-[#eb6e4b]">
                {user.role === 'ADMIN' ? t.dashboard.roles.ADMIN : user.role === 'COMPANY_ADMIN' ? t.dashboard.roles.COMPANY_ADMIN : t.dashboard.roles.WORKER}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
