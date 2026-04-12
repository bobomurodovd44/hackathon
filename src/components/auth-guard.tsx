'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth, UserRole } from '@/lib/auth-context'

interface AuthGuardProps {
  children: React.ReactNode
  variant?: 'authenticated' | 'public'
}

export function AuthGuard({ children, variant = 'authenticated' }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, getDashboardPath } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (variant === 'authenticated' && !isAuthenticated) {
      router.replace('/login')
      return
    } 
    
    if (variant === 'public' && isAuthenticated) {
      router.replace(getDashboardPath(user))
      return
    }

    // Role-based path protection (only for authenticated routes)
    if (variant === 'authenticated' && isAuthenticated && user) {
      const isSettings = pathname.startsWith('/settings')
      
      if (pathname.startsWith('/admin') && user.role !== UserRole.ADMIN) {
        router.replace(getDashboardPath(user))
      } else if (pathname.startsWith('/company') && user.role !== UserRole.COMPANY_ADMIN) {
        // Strict isolation: Even Admin is redirected to /admin if they try /company
        router.replace(getDashboardPath(user))
      } else if (pathname.startsWith('/user') && user.role !== UserRole.WORKER) {
        // Strict isolation: Non-workers are redirected to their own dashboard
        router.replace(getDashboardPath(user))
      }
    }
  }, [isLoading, isAuthenticated, variant, router, user, getDashboardPath, pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Prevent flash of content
  if (variant === 'authenticated' && !isAuthenticated) return null
  if (variant === 'public' && isAuthenticated) return null

  return <>{children}</>
}
