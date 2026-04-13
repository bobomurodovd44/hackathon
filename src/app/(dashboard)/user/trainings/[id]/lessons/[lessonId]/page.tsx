import React from "react"
import { LearnerLessonPlayer } from "@/components/trainings/learner-lesson-player"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string, lessonId: string }>
}

export default async function UserLessonPlayerPage({ params }: PageProps) {
  const { id, lessonId } = await params
  
  return (
    <LearnerLessonPlayer 
      trainingId={id} 
      lessonId={lessonId} 
    />
  )
}
