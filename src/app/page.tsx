'use client'

import { I18nProvider } from '@/i18n/provider'
import { LandingPageContent } from '@/components/landing-page-content'

export default function LandingPage() {
  return (
    <I18nProvider initialLang="uz">
      <LandingPageContent />
    </I18nProvider>
  )
}
