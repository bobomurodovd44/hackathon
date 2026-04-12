import React from "react"
import { ShieldCheck } from "lucide-react"
import { serverFetch } from "@/lib/server-api"
import { CompanyTrainingsClient } from "@/components/companies/company-trainings-client"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    id: string
  }
}

export default async function CompanyTrainingsPage({ params }: PageProps) {
  const { id } = params

  let company = null
  let initialTrainings = []
  let initialTotal = 0

  try {
    // Fetch company details
    company = await serverFetch(`/companies/${id}`)
    
    // Fetch initial trainings for this company
    const trainingsResult = await serverFetch(`/trainings?companyId=${id}&$limit=10&$sort[createdAt]=-1`)
    initialTrainings = trainingsResult?.data || []
    initialTotal = trainingsResult?.total || 0
  } catch (error) {
    console.error("Error fetching company trainings data:", error)
  }

  if (!company) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2">
        <ShieldCheck className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Company not found</h2>
        <p className="text-muted-foreground">The company you are looking for does not exist or you don't have access.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Company Trainings</h1>
        <p className="text-muted-foreground">
          Manage training materials and specializations for {company.name}.
        </p>
      </div>

      <CompanyTrainingsClient 
        companyId={id} 
        companyName={company.name}
        initialTrainings={initialTrainings} 
        initialTotal={initialTotal} 
      />
    </div>
  )
}
