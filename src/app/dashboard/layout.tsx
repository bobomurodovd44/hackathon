'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useTranslation } from '@/i18n/provider'
import { client } from '@/lib/feathers'

type SessionUser = {
  role: 'ADMIN' | 'COMPANY_ADMIN' | 'WORKER'
  firstName?: string
  lastName?: string
}

const allowedByRole = {
  ADMIN: ['/dashboard', '/dashboard/admin', '/dashboard/settings'],
  COMPANY_ADMIN: ['/dashboard', '/dashboard/manager', '/dashboard/settings'],
  WORKER: ['/dashboard', '/dashboard/employee', '/dashboard/settings']
} as const

const homeByRole = {
  ADMIN: '/dashboard/admin',
  COMPANY_ADMIN: '/dashboard/manager',
  WORKER: '/dashboard/employee'
} as const

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.reAuthenticate()
      .then((res) => {
        setUser(res.user as SessionUser)
      })
      .catch(() => {
        router.push('/login')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [router])

  const authorized = useMemo(() => {
    if (!user || !pathname) return false
    const allowedRoots = allowedByRole[user.role] || []
    return allowedRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`))
  }, [user, pathname])

  useEffect(() => {
    if (loading || !user || !pathname || authorized) return
    router.replace(homeByRole[user.role])
  }, [loading, user, pathname, authorized, router])

  if (loading || !user || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f6] dark:bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#eb6e4b] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono font-bold text-gray-500">{t.dashboard.common.loading}</span>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#faf8f6] dark:bg-background">
        <DashboardSidebar user={user} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-10">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
