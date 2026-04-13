'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-provider'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') {
        router.replace('/dashboard/admin')
      } else if (user.role === 'COMPANY_ADMIN') {
        router.replace('/dashboard/manager')
      } else {
        router.replace('/dashboard/employee')
      }
      setChecked(true)
    }
  }, [user, loading, router])

  if (!checked) return null

  return null
}
