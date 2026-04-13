import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/i18n/provider"

export function ConnectForm({
  className,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit">) {
  const router = useRouter()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6 text-center animate-in fade-in zoom-in-95 duration-500", className)}>
        <div className="w-16 h-16 bg-[#eb6e4b]/10 text-[#eb6e4b] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
        </div>
        <h2 className="text-2xl font-bold font-mono tracking-tight">{t.connect.successTitle}</h2>
        <p className="text-muted-foreground">{t.connect.successDesc}</p>
        <Button onClick={() => router.push("/")} variant="outline" className="mt-4">
          {t.connect.btnReturn}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6 relative", className)} {...props}>
      {/* Magic glow background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#eb6e4b]/20 via-orange-400/20 to-yellow-500/20 rounded-[2rem] blur-xl opacity-50 z-0 pointer-events-none"></div>
      
      <FieldGroup className="relative z-10 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xl">
        <div className="flex flex-col items-center gap-2 text-center mb-6">
          <div className="inline-flex px-3 py-1 rounded-full bg-[#eb6e4b]/10 text-[#eb6e4b] text-xs font-bold uppercase tracking-widest mb-2 border border-[#eb6e4b]/20">
            {t.connect.badge}
          </div>
          <h1 className="text-3xl font-black font-mono tracking-tight text-gray-900 dark:text-white">{t.connect.title}</h1>
          <p className="text-sm md:text-base text-balance text-muted-foreground max-w-sm">
            {t.connect.subtitle}
          </p>
        </div>
        
        <div className="space-y-6">
          <Field>
            <FieldLabel htmlFor="companyName" className="text-gray-700 dark:text-gray-300 font-bold">{t.connect.companyNameLabel}</FieldLabel>
            <Input id="companyName" type="text" placeholder={t.connect.companyNamePlaceholder} className="h-12 bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-white/10 text-lg" required minLength={2} />
          </Field>

          <Field>
            <FieldLabel htmlFor="email" className="text-gray-700 dark:text-gray-300 font-bold">{t.connect.emailLabel}</FieldLabel>
            <Input id="email" type="email" placeholder={t.connect.emailPlaceholder} className="h-12 bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-white/10 text-lg" required />
          </Field>

          
        </div>

        <Field className="mt-8">
          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#eb6e4b] to-orange-500 hover:from-[#d45e3c] hover:to-orange-600 text-white font-black h-14 text-lg rounded-xl shadow-[0_0_30px_rgba(235,110,75,0.4)] transition-transform hover:-translate-y-1">
            {loading ? t.connect.btnLoading : t.connect.btnSubmit}
          </Button>
          <FieldDescription className="text-center mt-3 text-xs opacity-70">
            {t.connect.disclaimer}
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
