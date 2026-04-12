'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { client } from './feathers'

export enum UserRole {
  ADMIN = 'ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  WORKER = 'WORKER',
}

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  companyId?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: any) => Promise<void>
  logout: () => Promise<void>
  getDashboardPath: (user: User | null) => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const getDashboardPath = (user: User | null) => {
    if (!user) return '/login'
    switch (user.role) {
      case UserRole.ADMIN:
        return '/admin'
      case UserRole.COMPANY_ADMIN:
        return '/company'
      case UserRole.WORKER:
        return '/user'
      default:
        return '/user'
    }
  }

  const authenticate = async () => {
    try {
      const response = await client.authenticate()
      setUser(response.user)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    authenticate()
  }, [])

  const login = async (credentials: any) => {
    setIsLoading(true)
    try {
      const response = await client.authenticate({
        strategy: 'local',
        ...credentials
      })
      setUser(response.user)
      router.push(getDashboardPath(response.user))
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await client.logout()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        getDashboardPath
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
