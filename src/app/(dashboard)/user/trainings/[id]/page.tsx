import React from "react"
import { LearnerTrainingDetail } from "@/components/trainings/learner-training-detail"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserTrainingDetailPage({ params }: PageProps) {
  const { id } = await params
  
  return (
    <main className="container py-8">
      <LearnerTrainingDetail trainingId={id} />
    </main>
  )
}
