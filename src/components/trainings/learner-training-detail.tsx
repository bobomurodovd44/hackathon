'use client'

import React, { useEffect, useState } from "react"
import { Loader2, ArrowLeft, Play, FileText, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { client } from "@/lib/feathers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface LearnerTrainingDetailProps {
  trainingId: string
}

export function LearnerTrainingDetail({ trainingId }: LearnerTrainingDetailProps) {
  const [training, setTraining] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [trainingRes, lessonsRes] = await Promise.all([
          client.service("trainings").get(trainingId),
          client.service("lessons").find({
            query: {
              trainingId,
              status: 'active',
              $sort: { order: 1 }
            }
          })
        ])
        
        setTraining(trainingRes)
        setLessons(lessonsRes.data)
      } catch (error) {
        console.error("Error fetching training details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [trainingId])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!training) return <div>Training not found.</div>

  const firstLessonId = lessons[0]?._id

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      <Link 
        href="/user/trainings" 
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-4" />
        Back to Catalog
      </Link>

      <div className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="w-fit border-primary/20 text-primary capitalize">
                {training.spec?.replace('-', ' ')}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight">{training.title}</h1>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {training.description}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base font-semibold" asChild disabled={!firstLessonId}>
              <Link href={`/user/trainings/${trainingId}/lessons/${firstLessonId}`}>
                <Play className="mr-2 h-5 w-5 fill-current" />
                Start Training
              </Link>
            </Button>
            <div className="text-sm text-muted-foreground font-medium">
               {lessons.length} Lessons • Sequential Learning
            </div>
          </div>
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden border shadow-2xl shadow-primary/5">
          {training.image_url ? (
            <Image 
              src={training.image_url} 
              alt={training.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <FileText className="h-20 w-20 text-muted-foreground/20" />
            </div>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold tracking-tight">Curriculum</h2>
        <div className="grid gap-3">
          {lessons.map((lesson, idx) => (
            <Link 
              key={lesson._id}
              href={`/user/trainings/${trainingId}/lessons/${lesson._id}`}
              className="group flex items-center justify-between p-4 rounded-xl border bg-card transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {idx + 1}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{lesson.type}</span>
                    <span>•</span>
                    <span>{lesson.description || "No description available"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                 <Circle className="h-5 w-5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
