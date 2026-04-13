'use client'

import React, { useEffect, useState, useCallback } from "react"
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, PlayCircle, FileText, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { client } from "@/lib/feathers"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface LearnerLessonPlayerProps {
  trainingId: string
  lessonId: string
}

export function LearnerLessonPlayer({ trainingId, lessonId }: LearnerLessonPlayerProps) {
  const [training, setTraining] = useState<any>(null)
  const [lesson, setLesson] = useState<any>(null)
  const [content, setContent] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [allLessons, setAllLessons] = useState<any[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  
  // Quiz state
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [trainingRes, lessonRes, lessonsListRes] = await Promise.all([
        client.service("trainings").get(trainingId),
        client.service("lessons").get(lessonId),
        client.service("lessons").find({
          query: { trainingId, status: 'active', $sort: { order: 1 } }
        })
      ])

      setTraining(trainingRes)
      setLesson(lessonRes)
      setAllLessons(lessonsListRes.data)

      if (lessonRes.type === 'teach') {
        const contentRes = await client.service("lesson-contents").find({
          query: { lessonId }
        })
        if (contentRes.data?.[0]) {
          const contentData = contentRes.data[0]
          setContent(contentData)
          
          if (contentData.videoId) {
            try {
              const upload = await client.service("uploads").get(contentData.videoId)
              setVideoUrl(upload.url)
            } catch (e) {
              console.warn("Video not found")
            }
          }
        }
      } else if (lessonRes.type === 'quiz') {
        const quizRes = await client.service("quizzes").find({
          query: { lessonId }
        })
        setQuiz(quizRes.data?.[0] || null)
      }
    } catch (error) {
      console.error("Error loading player data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [trainingId, lessonId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!lesson) return <div className="p-8 text-center">Lesson not found.</div>

  const currentIndex = allLessons.findIndex(l => l._id === lessonId)
  const prevLesson = allLessons[currentIndex - 1]
  const nextLesson = allLessons[currentIndex + 1]

  const handleQuizSubmit = () => {
    // In a real app, we'd send these to an AI grading service
    setIsQuizSubmitted(true)
    alert("Quiz answers submitted for AI evaluation! (Mock submission)")
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href={`/user/trainings/${trainingId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium line-clamp-1">{training?.title}</span>
              <span className="text-sm font-bold line-clamp-1">{lesson.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Badge variant="outline" className="hidden sm:inline-flex capitalize">
                {lesson.type}
             </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 max-w-5xl">
        <div className="flex flex-col gap-8">
          
          {/* TEACH Content */}
          {lesson.type === 'teach' && (
            <div className="flex flex-col gap-8">
              {videoUrl && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border shadow-2xl">
                  <video 
                    src={videoUrl} 
                    controls 
                    className="w-full h-full"
                    controlsList="nodownload"
                  />
                </div>
              )}
              
              <div className="flex flex-col gap-6">
                 <div>
                   <h2 className="text-3xl font-bold tracking-tight mb-2">{lesson.title}</h2>
                   <p className="text-muted-foreground">{lesson.description}</p>
                 </div>
                 
                 {content?.markdown && (
                   <div className="prose prose-blue dark:prose-invert max-w-none bg-card border rounded-2xl p-8 shadow-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content.markdown}
                      </ReactMarkdown>
                   </div>
                 )}

                 {!videoUrl && !content?.markdown && (
                   <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 border border-dashed rounded-2xl">
                      <FileText className="w-12 h-12 mb-4 opacity-20" />
                      <p>This lesson has no displayable content.</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* QUIZ Content */}
          {lesson.type === 'quiz' && (
            <div className="flex flex-col gap-8">
               <div className="flex flex-col gap-2">
                 <h2 className="text-3xl font-bold tracking-tight">Assignment: {lesson.title}</h2>
                 <p className="text-muted-foreground">Answer the following questions. Your responses will be evaluated by our AI grader.</p>
               </div>

               {quiz?.questions?.length > 0 ? (
                 <div className="space-y-8">
                    {quiz.questions.map((q: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-4 p-6 rounded-2xl border bg-card shadow-sm">
                         <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-lg">{q.questionText}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{q.points} Points</span>
                         </div>
                         <Textarea 
                           placeholder="Type your answer here..."
                           className="min-h-[120px] text-base"
                           value={answers[idx] || ""}
                           onChange={(e) => setAnswers({...answers, [idx]: e.target.value})}
                           disabled={isQuizSubmitted}
                         />
                      </div>
                    ))}
                    <div className="flex justify-center pt-4">
                       <Button size="lg" className="px-12 h-12 font-bold" onClick={handleQuizSubmit} disabled={isQuizSubmitted}>
                          {isQuizSubmitted ? <CheckCircle2 className="mr-2 h-5 w-5" /> : null}
                          {isQuizSubmitted ? "Answers Submitted" : "Submit Quiz"}
                       </Button>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 border border-dashed rounded-2xl">
                    <CheckCircle className="w-12 h-12 mb-4 opacity-20" />
                    <p>This quiz has no questions yet.</p>
                 </div>
               )}
            </div>
          )}

          {/* Navigation Bar */}
          <div className="pt-8 mt-8 border-t flex items-center justify-between gap-4">
             <Button 
                variant="outline" 
                size="lg" 
                disabled={!prevLesson} 
                asChild={!!prevLesson}
                className="flex-1 sm:flex-none h-12"
              >
                {prevLesson ? (
                  <Link href={`/user/trainings/${trainingId}/lessons/${prevLesson._id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous Lesson
                  </Link>
                ) : (
                  <span>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    No previous
                  </span>
                )}
             </Button>

             <div className="hidden md:flex flex-col items-center text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-bold text-foreground">{currentIndex + 1} / {allLessons.length}</span>
             </div>

             <Button 
                size="lg" 
                disabled={!nextLesson} 
                asChild={!!nextLesson}
                className="flex-1 sm:flex-none h-12"
              >
                {nextLesson ? (
                  <Link href={`/user/trainings/${trainingId}/lessons/${nextLesson._id}`}>
                    Next Lesson
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <span>
                    Course Completed
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </span>
                )}
             </Button>
          </div>

        </div>
      </main>
    </div>
  )
}
