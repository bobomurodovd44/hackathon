'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { client } from '@/lib/feathers'

type AuthContextType = {
  user: any | null
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Pages that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/connect', '/hidden-admin-setup']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshUser = async () => {
    try {
      // Add a 5s timeout to re-authentication to prevent infinite loading if backend is down
      const authPromise = client.reAuthenticate()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth Timeout')), 5000)
      )
      
      const res = await Promise.race([authPromise, timeoutPromise]) as any
      setUser(res.user)
      
      // If we are on login and already logged in, go to dashboard
      const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/hidden-admin-setup';
      if (isAuthPage) {
        router.push('/dashboard')
      }
    } catch (error) {
      setUser(null)
      
      // Check if current route is private
      const isPublic = publicRoutes.includes(pathname || '/') || pathname?.startsWith('/ru');
      
      if (!isPublic) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Small delay to ensure Next.js router is fully initialized
    const timer = setTimeout(() => {
      refreshUser()
    }, 100)
    
    // Listen for feathers auth events
    client.on('authenticated', (result: any) => {
      setUser(result.user)
    })

    client.on('logout', () => {
      setUser(null)
      router.push('/')
    })
    
    return () => {
        clearTimeout(timer)
        client.removeAllListeners('authenticated')
        client.removeAllListeners('logout')
    }
  }, [pathname, router])

  const logout = async () => {
    try {
      await client.logout()
    } catch (e) {
      // ignore
    }
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
