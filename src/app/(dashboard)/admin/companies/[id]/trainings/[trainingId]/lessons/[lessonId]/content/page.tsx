import React from "react"
import { serverFetch } from "@/lib/server-api"
import { LessonContentClient } from "@/components/trainings/lesson-content-client"
import { LessonQuizClient } from "@/components/trainings/lesson-quiz-client"

export const dynamic = 'force-dynamic'

export default async function AdminCompanyLessonContentPage({ params }: { params: Promise<{ id: string, trainingId: string, lessonId: string }> }) {
  const resolvedParams = await params
  let lessonTree = null

  try {
    lessonTree = await serverFetch(`/lessons/${resolvedParams.lessonId}`)
  } catch (error) {
    console.error("Error fetching admin lesson details:", error)
  }

  if (!lessonTree) {
    return <div>Lesson not found.</div>
  }

  if (lessonTree.type === 'quiz') {
    return (
      <LessonQuizClient
        trainingId={resolvedParams.trainingId}
        lessonId={resolvedParams.lessonId}
        lessonTitle={lessonTree.title}
        companyId={resolvedParams.id}
        isPortal={false}
      />
    )
  }

  return (
    <LessonContentClient
      trainingId={resolvedParams.trainingId}
      lessonId={resolvedParams.lessonId}
      lessonTitle={lessonTree.title}
      companyId={resolvedParams.id}
      isPortal={false}
    />
  )
}
