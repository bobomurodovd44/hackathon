import React from "react"
import { ShieldCheck } from "lucide-react"
import { serverFetch } from "@/lib/server-api"
import { LessonContentClient } from "@/components/trainings/lesson-content-client"
import { LessonQuizClient } from "@/components/trainings/lesson-quiz-client"

export const dynamic = 'force-dynamic'

export default async function CompanyPortalLessonContentPage({ params }: { params: Promise<{ trainingId: string, lessonId: string }> }) {
  const resolvedParams = await params
  let lessonTree = null
  let userProfile = null

  try {
    const usersResult = await serverFetch('/users')
    userProfile = usersResult?.data?.[0]
    lessonTree = await serverFetch(`/lessons/${resolvedParams.lessonId}`)
  } catch (error) {
    console.error("Error fetching portal lesson details:", error)
  }

  if (!userProfile?.companyId || !lessonTree) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2">
        <ShieldCheck className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Lesson not found</h2>
        <p className="text-muted-foreground">We couldn't locate this lesson record.</p>
      </div>
    )
  }

  if (lessonTree.type === 'quiz') {
    return (
      <LessonQuizClient
        trainingId={resolvedParams.trainingId}
        lessonId={resolvedParams.lessonId}
        lessonTitle={lessonTree.title}
        companyId={userProfile.companyId}
        isPortal={true}
      />
    )
  }

  return (
    <LessonContentClient
      trainingId={resolvedParams.trainingId}
      lessonId={resolvedParams.lessonId}
      lessonTitle={lessonTree.title}
      companyId={userProfile.companyId}
      isPortal={true}
    />
  )
}
