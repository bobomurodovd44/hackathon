'use client'

import React, { useEffect, useState, useRef } from "react"
import {
  Loader2, ArrowLeft, Save, Sparkles, Send, X, Bot, User,
  Plus, Trash2, ChevronDown, ChevronUp, ClipboardList
} from "lucide-react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { client } from "@/lib/feathers"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import jsCookie from "js-cookie"

interface LessonQuizClientProps {
  companyId?: string
  trainingId: string
  lessonId: string
  lessonTitle: string
  isPortal?: boolean
}

interface QuizQuestion {
  questionText: string
  points: number
  rubric: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  isLoading?: boolean
}

export function LessonQuizClient({
  companyId,
  trainingId,
  lessonId,
  lessonTitle,
  isPortal = false,
}: LessonQuizClientProps) {
  const [existingQuizId, setExistingQuizId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [passingScore, setPassingScore] = useState<number>(60)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsaved, setHasUnsaved] = useState(false)

  // AI Chat state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatPrompt, setChatPrompt] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  const initialized = useRef(false)

  // ── Fetch existing quiz on mount ──────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    ;(async () => {
      try {
        const result: any = await client.service('quizzes').find({
          query: { lessonId }
        })
        const existing = result?.data?.[0] || result?.[0]
        if (existing) {
          setExistingQuizId(existing._id)
          setQuestions(existing.questions || [])
          setPassingScore(existing.passingScore ?? 60)
        }
      } catch (e) {
        console.warn('No quiz found for this lesson', e)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [lessonId])

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // ── Question helpers ──────────────────────────────────────────────────────
  const addQuestion = () => {
    const next = [...questions, { questionText: '', points: 10, rubric: '' }]
    setQuestions(next)
    setExpandedIdx(next.length - 1)
    setHasUnsaved(true)
  }

  const removeQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx))
    setExpandedIdx(null)
    setHasUnsaved(true)
  }

  const updateQuestion = (idx: number, field: keyof QuizQuestion, value: string | number) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q))
    setHasUnsaved(true)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        lessonId,
        trainingId,
        questions,
        passingScore
      }
      if (existingQuizId) {
        await client.service('quizzes').patch(existingQuizId, payload)
      } else {
        const created: any = await client.service('quizzes').create(payload)
        setExistingQuizId(created._id)
      }
      setHasUnsaved(false)
      alert('Quiz saved successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to save quiz.')
    } finally {
      setIsSaving(false)
    }
  }

  // ── AI Chat ───────────────────────────────────────────────────────────────
  const handleSendPrompt = async () => {
    const trimmed = chatPrompt.trim()
    if (!trimmed || isChatLoading) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const loadingMsg: ChatMessage = { role: 'assistant', content: '', isLoading: true }

    setChatMessages(prev => [...prev, userMsg, loadingMsg])
    setChatPrompt('')
    setIsChatLoading(true)

    try {
      const result: any = await client.service('ai-chat').create({
        type: 'quiz_gen',
        lessonId,
        prompt: trimmed
      })

      const response: string = result.response || ''
      const resolvedType: string = result.type || ''

      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: resolvedType === 'quiz_gen' ? `✅ Generated ${JSON.parse(response).length} questions and added to your quiz!` : response }
      ])

      // If AI returned quiz questions, parse and APPEND them
      if (resolvedType === 'quiz_gen' && response.trim()) {
        try {
          const parsed: QuizQuestion[] = JSON.parse(response)
          if (Array.isArray(parsed)) {
            setQuestions(prev => [...prev, ...parsed])
            setHasUnsaved(true)
          }
        } catch {
          console.warn('Could not parse AI quiz JSON', response)
        }
      }
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: `⚠️ Error: ${err.message || 'Something went wrong.'}` }
      ])
    } finally {
      setIsChatLoading(false)
      chatInputRef.current?.focus()
    }
  }

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendPrompt()
    }
  }

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0)

  const backUrl = isPortal
    ? `/company/trainings/${trainingId}/lessons`
    : `/admin/companies/${companyId}/trainings/${trainingId}/lessons`

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <Link
            href={backUrl}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="size-4" />
            Back to Lessons
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quiz: {lessonTitle}</h1>
              <p className="text-muted-foreground">Build quiz questions for this lesson. Use AI to generate them automatically.</p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsaved && <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>}
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Quiz
              </Button>
            </div>
          </div>
        </div>

        {/* ── Settings Card ────────────────────────────────────────────────── */}
        <div className="rounded-md border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary">
            <ClipboardList className="w-5 h-5" />
            <h2 className="text-base font-semibold">Quiz Settings</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col gap-1.5 w-full sm:max-w-xs">
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={e => { setPassingScore(Number(e.target.value)); setHasUnsaved(true) }}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Workers must score at least this percentage to pass.</p>
            </div>
            <div className="flex flex-col gap-1 pt-7">
              <p className="text-sm font-medium">{questions.length} questions</p>
              <p className="text-sm text-muted-foreground">{totalPoints} total points</p>
              <p className="text-sm text-muted-foreground">Pass threshold: {Math.round(totalPoints * passingScore / 100)} pts</p>
            </div>
          </div>
        </div>

        {/* ── Questions ────────────────────────────────────────────────────── */}
        <div className="rounded-md border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <ClipboardList className="w-5 h-5" />
              <h2 className="text-base font-semibold">Questions</h2>
            </div>
            <Button variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </Button>
          </div>

          {questions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center text-muted-foreground">
              <ClipboardList className="h-10 w-10 opacity-30" />
              <p className="text-sm">No questions yet.</p>
              <p className="text-xs">Click "Add Question" or use the AI Assistant to generate them.</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {questions.map((q, idx) => (
              <div key={idx} className="rounded-lg border bg-background shadow-sm overflow-hidden">
                {/* Question header: split toggle area and delete button side by side */}
                <div className="flex items-center">
                  <div
                    role="button"
                    tabIndex={0}
                    className="flex-1 flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors cursor-pointer select-none"
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                    onKeyDown={e => e.key === 'Enter' && setExpandedIdx(expandedIdx === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {q.questionText || <span className="text-muted-foreground italic">Untitled question</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-muted-foreground">{q.points} pts</span>
                      {expandedIdx === idx ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                  <button
                    onClick={() => removeQuestion(idx)}
                    className="px-3 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border-l"
                    aria-label="Remove question"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Expanded form */}
                {expandedIdx === idx && (
                  <div className="border-t px-4 py-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label>Question</Label>
                      <Textarea
                        placeholder="Enter the question the worker will be asked…"
                        value={q.questionText}
                        onChange={e => updateQuestion(idx, 'questionText', e.target.value)}
                        className="min-h-[80px] resize-y text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 max-w-[180px]">
                      <Label htmlFor={`pts-${idx}`}>Points</Label>
                      <Input
                        id={`pts-${idx}`}
                        type="number"
                        min={1}
                        value={q.points}
                        onChange={e => updateQuestion(idx, 'points', Number(e.target.value))}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>AI Grading Rubric</Label>
                      <Textarea
                        placeholder="Explain what the AI should look for when grading this answer. E.g. 'Must mention X and Y. Award full points if both are present.'"
                        value={q.rubric}
                        onChange={e => updateQuestion(idx, 'rubric', e.target.value)}
                        className="min-h-[80px] resize-y text-sm"
                      />
                      <p className="text-xs text-muted-foreground">This rubric is only seen by the AI grader — workers won't see it.</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Assistant FAB ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-primary/30 active:scale-95 ${isChatOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'}`}
        aria-label="Open AI assistant"
      >
        <Sparkles className="h-4 w-4" />
        AI Assistant
      </button>

      {/* ── AI Sliding Panel ─────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 right-0 z-50 flex h-[600px] w-full max-w-md flex-col rounded-t-2xl border bg-background shadow-2xl transition-all duration-300 ease-in-out sm:bottom-6 sm:right-6 sm:rounded-2xl ${isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none sm:translate-y-8'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-primary/5 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">AI Quiz Assistant</p>
              <p className="text-xs text-muted-foreground mt-0.5">Generates quiz questions for this lesson</p>
            </div>
          </div>
          <button
            onClick={() => setIsChatOpen(false)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">AI Quiz Generator</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Ask the AI to generate quiz questions based on the lesson content and training materials. Questions will be added directly to your quiz.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                {[
                  "Generate 5 quiz questions",
                  "Make a difficult quiz",
                  "Create comprehension questions"
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setChatPrompt(s)}
                    className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>
              <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                {msg.isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Generating questions...</span>
                  </span>
                ) : msg.role === 'assistant' ? (
                  <div className="prose prose-xs dark:prose-invert max-w-none text-xs [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Input */}
        <div className="border-t p-3 flex gap-2 items-end">
          <Textarea
            ref={chatInputRef}
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            onKeyDown={handleChatKeyDown}
            placeholder="e.g. Generate 5 quiz questions about this lesson…"
            className="min-h-[44px] max-h-[120px] resize-none text-sm py-2.5 leading-snug"
            rows={1}
            disabled={isChatLoading}
          />
          <Button
            size="icon"
            onClick={handleSendPrompt}
            disabled={!chatPrompt.trim() || isChatLoading}
            className="h-[44px] w-[44px] shrink-0 rounded-xl"
          >
            {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isChatOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}
    </>
  )
}
