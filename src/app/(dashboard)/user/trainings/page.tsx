import React from "react"
import { LearnerTrainingList } from "@/components/trainings/learner-training-list"

export const dynamic = 'force-dynamic'

export default function UserTrainingsPage() {
  return (
    <main className="container py-8">
      <LearnerTrainingList />
    </main>
  )
}
