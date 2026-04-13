import React from "react"
import { redirect } from "next/navigation"
import { serverFetch } from "@/lib/server-api"
import { CompanyWorkersClient } from "@/components/companies/company-workers-client"

export const dynamic = 'force-dynamic'

export default async function CompanyWorkersPage() {
  let companyName = "Company"
  let companyId = ""
  let initialData = { data: [], total: 0 }

  try {
    // Get the logged-in user to extract their companyId
    const usersResult = await serverFetch('/users')
    const profile = usersResult?.data?.[0]

    if (!profile?.companyId) {
      redirect('/company')
    }

    companyId = profile.companyId

    // Fetch company name
    const company = await serverFetch(`/companies/${companyId}`)
    if (company?.name) companyName = company.name

    // Fetch initial workers (role=WORKER, same company)
    const result = await serverFetch(
      `/users?companyId=${companyId}&role=WORKER&$limit=10&$sort[createdAt]=-1`
    )
    if (result) {
      initialData = result
    } else {
      redirect('/login')
    }
  } catch (error) {
    console.error("Error loading company workers page:", error)
  }

  return (
    <CompanyWorkersClient
      companyId={companyId}
      companyName={companyName}
      initialWorkers={initialData.data}
      initialTotal={initialData.total}
    />
  )
}
