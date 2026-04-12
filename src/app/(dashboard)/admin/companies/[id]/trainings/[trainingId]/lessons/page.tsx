import React from "react"
import { serverFetch } from "@/lib/server-api"
import { TrainingLessonsClient } from "@/components/trainings/training-lessons-client"

export const dynamic = 'force-dynamic'

export default async function AdminCompanyTrainingLessonsPage({ params }: { params: Promise<{ id: string, trainingId: string }> }) {
  const resolvedParams = await params
  let training = null
  let initialLessons = []

  try {
    training = await serverFetch(`/trainings/${resolvedParams.trainingId}`)
    const lessonsResult = await serverFetch(`/lessons?trainingId=${resolvedParams.trainingId}&$sort[order]=1`)
    initialLessons = lessonsResult?.data || []
  } catch (error) {
    console.error("Error fetching admin lessons data:", error)
  }

  if (!training) {
    return <div>Training not found.</div>
  }

  return (
    <TrainingLessonsClient 
      trainingId={resolvedParams.trainingId} 
      trainingTitle={training.title}
      companyId={resolvedParams.id}
      initialLessons={initialLessons} 
      isPortal={false}
    />
  )
}
