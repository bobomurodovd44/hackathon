import React from "react"
import { ShieldCheck } from "lucide-react"
import { serverFetch } from "@/lib/server-api"
import { TrainingLessonsClient } from "@/components/trainings/training-lessons-client"

export const dynamic = 'force-dynamic'

export default async function CompanyPortalTrainingLessonsPage({ params }: { params: Promise<{ trainingId: string }> }) {
  const resolvedParams = await params
  let training = null
  let initialLessons = []
  let userProfile = null

  try {
    // 1. Fetch current user profile to get companyId
    const usersResult = await serverFetch('/users')
    userProfile = usersResult?.data?.[0]

    // 2. Fetch training
    training = await serverFetch(`/trainings/${resolvedParams.trainingId}`)
    
    // 3. Fetch initial lessons for this training
    const lessonsResult = await serverFetch(`/lessons?trainingId=${resolvedParams.trainingId}&$sort[order]=1`)
    initialLessons = lessonsResult?.data || []
    
  } catch (error) {
    console.error("Error fetching portal lessons data:", error)
  }

  if (!userProfile?.companyId || !training) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2">
        <ShieldCheck className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Training not found</h2>
        <p className="text-muted-foreground">We couldn't locate this training record.</p>
      </div>
    )
  }

  return (
    <TrainingLessonsClient 
      trainingId={resolvedParams.trainingId} 
      trainingTitle={training.title}
      companyId={userProfile.companyId}
      initialLessons={initialLessons} 
      isPortal={true}
    />
  )
}
