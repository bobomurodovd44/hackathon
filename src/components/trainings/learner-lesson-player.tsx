'use client'

import React, { useEffect, useState, useCallback } from "react"
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, PlayCircle, FileText, CheckCircle2, Bot, Sparkles } from "lucide-react"
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
  const [result, setResult] = useState<any>(null)
  const [isGrading, setIsGrading] = useState(false)

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
        const [quizRes, resultRes] = await Promise.all([
          client.service("quizzes").find({ query: { lessonId } }),
          client.service("quiz-results").find({ 
            query: { lessonId, status: 'completed', $sort: { createdAt: -1 }, $limit: 1 } 
          })
        ])
        setQuiz(quizRes.data?.[0] || null)
        if (resultRes.data?.[0]) {
          setResult(resultRes.data[0])
          // Initialize answers from result if it exists
          const savedAnswers: any = {}
          resultRes.data[0].answers.forEach((ans: string, i: number) => {
            savedAnswers[i] = ans
          })
          setAnswers(savedAnswers)
        }
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

  const handleQuizSubmit = async () => {
    setIsGrading(true)
    try {
      // Map answers record to array
      const answersArray = quiz.questions.map((_: any, i: number) => answers[i] || "")
      
      const newResult = await client.service("quiz-results").create({
        quizId: quiz._id,
        lessonId,
        answers: answersArray
      })
      
      setResult(newResult)
    } catch (error: any) {
      console.error("Grading failed:", error)
      alert(error.message || "Failed to grade quiz. Please try again.")
    } finally {
      setIsGrading(false)
    }
  }

  const handleRetake = () => {
    setResult(null)
    setAnswers({})
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
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
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium line-clamp-1">{training?.title}</span>
              <span className="text-xs sm:text-sm font-bold line-clamp-1">{lesson.title}</span>
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
                   <div className="prose prose-blue dark:prose-invert max-w-none bg-card border rounded-2xl p-6 sm:p-8 shadow-sm">
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
                 <div className="flex items-center justify-between">
                   <h2 className="text-3xl font-bold tracking-tight">Assessment: {lesson.title}</h2>
                   {result && (
                     <Badge variant={result.isPassed ? "default" : "destructive"} className="h-8 px-4 text-sm">
                        {result.isPassed ? "PASSED" : "FAILED"}
                     </Badge>
                   )}
                 </div>
                 <p className="text-muted-foreground">Answer the following questions. Your responses will be evaluated by our AI grader.</p>
               </div>

               {result && (
                 <div className={`p-6 rounded-2xl border ${result.isPassed ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/20'} flex flex-col sm:flex-row items-center justify-between gap-6`}>
                    <div className="flex flex-col gap-1 text-center sm:text-left">
                       <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Total Score</p>
                       <p className={`text-5xl font-black ${result.isPassed ? 'text-primary' : 'text-destructive'}`}>
                          {result.totalScore} <span className="text-xl font-normal text-muted-foreground">/ {quiz.questions.reduce((s:any, q:any)=>s+q.points, 0)}</span>
                       </p>
                    </div>
                    <div className="flex flex-col gap-3">
                       <p className="text-sm text-muted-foreground max-w-xs text-center sm:text-right">
                          {result.isPassed 
                            ? "Congratulations! You have successfully completed this assessment. You can now move to the next lesson." 
                            : "You didn't reach the passing score. Don't worry, you can review the material and try again."}
                       </p>
                       {!result.isPassed && (
                         <Button variant="outline" onClick={handleRetake} className="w-full">
                           Try Again
                         </Button>
                       )}
                    </div>
                 </div>
               )}

               {quiz?.questions?.length > 0 ? (
                 <div className="space-y-8">
                    {quiz.questions.map((q: any, idx: number) => (
                      <div key={idx} className={`flex flex-col gap-4 p-6 rounded-2xl border bg-card shadow-sm transition-all ${result ? (result.aiEvaluations?.[idx]?.score > 0 ? 'border-primary/10' : 'border-destructive/10') : ''}`}>
                         <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-lg">{q.questionText}</span>
                            <div className="ml-auto flex flex-col items-end">
                              <span className="text-xs text-muted-foreground font-medium">{q.points} Points</span>
                              {result && (
                                <span className={`text-sm font-bold ${result.aiEvaluations?.[idx]?.score > 0 ? 'text-primary' : 'text-destructive'}`}>
                                   Score: {result.aiEvaluations?.[idx]?.score || 0}
                                </span>
                              )}
                            </div>
                         </div>
                         
                         <Textarea 
                           placeholder="Type your answer here..."
                           className="min-h-[120px] text-base"
                           value={answers[idx] || ""}
                           onChange={(e) => setAnswers({...answers, [idx]: e.target.value})}
                           disabled={!!result || isGrading}
                         />

                         {result?.aiEvaluations?.[idx] && (
                           <div className="mt-2 p-4 rounded-xl bg-muted/50 border flex gap-3 italic text-sm text-muted-foreground">
                              <Bot className="h-5 w-5 shrink-0 text-primary" />
                              <p>{result.aiEvaluations[idx].feedback}</p>
                           </div>
                         )}
                      </div>
                    ))}

                    {!result && (
                      <div className="flex justify-center pt-4">
                         <Button 
                            size="lg" 
                            className="px-12 h-14 font-bold rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95" 
                            onClick={handleQuizSubmit} 
                            disabled={isGrading}
                          >
                            {isGrading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Sparkles className="mr-3 h-5 w-5" />}
                            {isGrading ? "AI is evaluating your answers..." : "Submit for AI Evaluation"}
                         </Button>
                      </div>
                    )}
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
                className="flex-1 sm:flex-none h-12 rounded-xl"
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
                <p>Lesson {currentIndex + 1} of {allLessons.length}</p>
                <div className="w-32 h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                   <div 
                     className="h-full bg-primary transition-all duration-500" 
                     style={{ width: `${((currentIndex + 1) / allLessons.length) * 100}%` }}
                   />
                </div>
             </div>

             <Button 
                size="lg" 
                disabled={!nextLesson} 
                asChild={!!nextLesson}
                className="flex-1 sm:flex-none h-12 rounded-xl"
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
