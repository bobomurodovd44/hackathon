import React from "react"
import { ShieldCheck } from "lucide-react"
import { serverFetch } from "@/lib/server-api"
import { CompanyTrainingsClient } from "@/components/companies/company-trainings-client"

export const dynamic = 'force-dynamic'

export default async function CompanyPortalTrainingsPage() {
  let company = null
  let initialTrainings = []
  let initialTotal = 0
  let userProfile = null

  try {
    // 1. Fetch current user profile to get companyId
    const usersResult = await serverFetch('/users')
    userProfile = usersResult?.data?.[0]

    if (userProfile?.companyId) {
      const companyId = userProfile.companyId
      
      // 2. Fetch company details
      company = await serverFetch(`/companies/${companyId}`)
      
      // 3. Fetch initial trainings for this company
      const trainingsResult = await serverFetch(`/trainings?companyId=${companyId}&$limit=10&$sort[createdAt]=-1`)
      initialTrainings = trainingsResult?.data || []
      initialTotal = trainingsResult?.total || 0
    }
  } catch (error) {
    console.error("Error fetching portal trainings data:", error)
  }

  if (!userProfile?.companyId || !company) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2">
        <ShieldCheck className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Organization not found</h2>
        <p className="text-muted-foreground">We couldn't link your account to a company. Please contact support.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Organization Trainings</h1>
        <p className="text-muted-foreground">
          Manage and review the training catalog for your team members.
        </p>
      </div>

      <CompanyTrainingsClient 
        companyId={userProfile.companyId} 
        companyName={company.name}
        initialTrainings={initialTrainings} 
        initialTotal={initialTotal} 
        isPortal={true}
      />
    </div>
  )
}
