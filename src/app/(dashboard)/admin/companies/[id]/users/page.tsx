import React from "react"
import { serverFetch } from "@/lib/server-api"
import { CompanyUsersClient } from "@/components/companies/company-users-client"
import { redirect, notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CompanyUsersPage({ params }: Props) {
  const { id: companyId } = await params
  
  let companyName = "Company"
  let initialData = { data: [], total: 0 }
  
  try {
    // 1. Fetch Company name
    const company = await serverFetch(`/companies/${companyId}`)
    if (!company) {
      notFound()
    }
    companyName = company.name

    // 2. Fetch initial users for this company
    const result = await serverFetch(`/users?companyId=${companyId}&$limit=10&$sort[createdAt]=-1`)
    if (result) {
      initialData = result
    } else {
      // If 401 or null, redirect to login
      redirect('/login')
    }
  } catch (error) {
    console.error("Error fetching initial data for Company Users on server:", error)
    // If it's a 404 from the fetch, show notFound
    if (error instanceof Error && error.message.includes('404')) {
      notFound()
    }
  }

  return (
    <CompanyUsersClient 
      companyId={companyId}
      companyName={companyName}
      initialUsers={initialData.data} 
      initialTotal={initialData.total} 
    />
  )
}
