'use client'

import React, { useEffect, useState, useRef } from "react"
import { Loader2, ArrowLeft, Save, Video, FileText, Sparkles, Send, X, ChevronDown, Bot, User } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { client } from "@/lib/feathers"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { uploadFile } from "@/lib/upload"
import { FileUpload } from "@/components/ui/file-upload"
import jsCookie from "js-cookie"

interface LessonContentClientProps {
  companyId?: string
  trainingId: string
  lessonId: string
  lessonTitle: string
  isPortal?: boolean
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  isLoading?: boolean
}

export function LessonContentClient({
  companyId,
  trainingId,
  lessonId,
  lessonTitle,
  isPortal = false
}: LessonContentClientProps) {
  const [existingId, setExistingId] = useState<string | null>(null)
  
  const [markdown, setMarkdown] = useState("")
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // AI Chat state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatPrompt, setChatPrompt] = useState("")
  const [chatMode, setChatMode] = useState<'markdown_gen' | 'plan_gen' | 'ask'>('markdown_gen')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  
  const initialized = useRef(false)
  const initialDataLoaded = useRef(false)

  // 1. Fetch data on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const fetchContent = async () => {
      try {
        const result = await client.service("lesson-contents").find({
          query: { lessonId: lessonId }
        })
        
        let loadedMarkdown = ""
        let loadedVideoId = null
        let loadedVideoUrl = null

        if (result.data && result.data.length > 0) {
          const content = result.data[0]
          setExistingId(content._id)
          loadedMarkdown = content.markdown || ""
          loadedVideoId = content.videoId || null
          
          if (loadedVideoId) {
            try {
              const upload = await client.service("uploads").get(loadedVideoId)
              loadedVideoUrl = upload.url
            } catch (e) {
              console.warn("Could not fetch video URL", e)
            }
          }
        }

        // Check local storage for drafts
        const draft = localStorage.getItem(`draft_lesson_${lessonId}`)
        if (draft && draft !== loadedMarkdown) {
          if (confirm("Found an unsaved draft in your browser. Would you like to restore it?")) {
            loadedMarkdown = draft
            setHasUnsavedChanges(true)
          } else {
            localStorage.removeItem(`draft_lesson_${lessonId}`)
          }
        }

        setMarkdown(loadedMarkdown)
        setVideoId(loadedVideoId)
        setVideoUrl(loadedVideoUrl)
        initialDataLoaded.current = true
      } catch (error) {
        console.error("Failed to load lesson content", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContent()
  }, [lessonId])

  // 2. Draft Saving & BeforeUnload logic
  useEffect(() => {
    if (!initialDataLoaded.current) return
    
    const saveDraft = () => {
      if (markdown) {
        localStorage.setItem(`draft_lesson_${lessonId}`, markdown)
      } else {
        localStorage.removeItem(`draft_lesson_${lessonId}`)
      }
    }

    const timer = setTimeout(saveDraft, 1000)
    return () => clearTimeout(timer)
  }, [markdown, lessonId])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Scroll chat to bottom whenever messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleMarkdownChange = (val: string) => {
    setMarkdown(val)
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        lessonId,
        markdown: markdown.trim() || undefined,
        videoId: videoId || undefined
      }

      if (existingId) {
        await client.service("lesson-contents").patch(existingId, payload)
      } else {
        const created = await client.service("lesson-contents").create(payload)
        setExistingId(created._id)
      }
      
      localStorage.removeItem(`draft_lesson_${lessonId}`)
      setHasUnsavedChanges(false)
      alert("Lesson content saved successfully!")
    } catch (error: any) {
      console.error(error)
      alert(error.message || "Failed to save lesson content. Check rules.")
    } finally {
      setIsSaving(false)
    }
  }

  // ─── AI Chat handlers ──────────────────────────────────────────────────────
  const handleSendPrompt = async () => {
    const trimmed = chatPrompt.trim()
    if (!trimmed || isChatLoading) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const loadingMsg: ChatMessage = { role: 'assistant', content: '', isLoading: true }
    
    setChatMessages(prev => [...prev, userMsg, loadingMsg])
    setChatPrompt("")
    setIsChatLoading(true)

    try {
      const result: any = await client.service('ai-chat').create({
        type: chatMode,
        lessonId,
        prompt: trimmed
      })

      const aiMarkdown: string = result.response || ''

      // Replace loading message with real response
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: aiMarkdown }
      ])

      // Auto-paste markdown into the editor if in generation mode
      if (aiMarkdown.trim() && (chatMode === 'markdown_gen' || chatMode === 'plan_gen')) {
        const separator = markdown.trim() ? '\n\n---\n\n' : ''
        handleMarkdownChange(markdown + separator + aiMarkdown)
      }
    } catch (error: any) {
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: `⚠️ Error: ${error.message || 'Something went wrong.'}` }
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
              <h1 className="text-3xl font-bold tracking-tight">Content: {lessonTitle}</h1>
              <p className="text-muted-foreground">
                Configure videos and markdown body for this lesson.
              </p>
            </div>
            <div className="flex items-center gap-3">
               {hasUnsavedChanges && (
                 <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
               )}
              <Button onClick={handleSave} disabled={isSaving || isUploading}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-md border bg-card p-6 shadow-sm flex flex-col gap-8">
          {/* Video Upload */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary">
              <Video className="w-5 h-5" />
              <h3 className="font-medium text-lg leading-none">Video Material</h3>
            </div>
            
            <FileUpload
              type="video"
              accept="video/*"
              value={videoUrl}
              isUploading={isUploading}
              progress={uploadProgress}
              status={uploadStatus}
              onUpload={async (file) => {
                setIsUploading(true)
                setUploadProgress(0)
                setUploadStatus("Preparing upload...")
                try {
                  const token = jsCookie.get("feathers-jwt") || ""
                  const result = await uploadFile(file, token, (msg) => {
                    setUploadStatus(msg)
                    if (msg.includes("Uploading...")) {
                      const match = msg.match(/(\d+\.?\d*)\sMB\s\/\s(\d+\.?\d*)\sMB/)
                      if (match) {
                        const current = parseFloat(match[1])
                        const total = parseFloat(match[2])
                        setUploadProgress(Math.round((current / total) * 100))
                      }
                    }
                  })
                  setVideoId(result._id)
                  setVideoUrl(result.url)
                  setHasUnsavedChanges(true)
                  setUploadProgress(100)
                  setUploadStatus("Upload complete!")
                } catch (error: any) {
                  alert(`Upload failed: ${error.message}`)
                } finally {
                  setIsUploading(false)
                }
              }}
              onRemove={() => {
                setVideoId(null)
                setVideoUrl(null)
                setHasUnsavedChanges(true)
              }}
              label="Click to upload lesson video"
            />
          </div>

          {/* Markdown Body */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" />
                <h3 className="font-medium text-lg leading-none">Lesson Body</h3>
             </div>
             
             <Tabs defaultValue="write" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="write" className="mt-0 focus-visible:outline-none ring-offset-background">
                <Textarea 
                  value={markdown}
                  onChange={(e) => handleMarkdownChange(e.target.value)}
                  placeholder="Compose your lesson content using Markdown... or use the AI assistant ✨"
                  className="min-h-[500px] font-mono resize-y bg-background p-4 text-base focus-visible:ring-1 focus-visible:ring-primary/20"
                />
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0 focus-visible:outline-none ring-offset-background">
                <div className="min-h-[500px] rounded-md p-6 bg-background border border-input shadow-sm">
                  {markdown.trim() ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {markdown}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex h-[400px] items-center justify-center text-muted-foreground text-sm italic">
                      Nothing to preview yet.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </div>

      {/* ── AI Chat FAB ────────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-primary/30 active:scale-95 ${isChatOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'}`}
        aria-label="Open AI assistant"
      >
        <Sparkles className="h-4 w-4" />
        AI Assistant
      </button>

      {/* ── AI Chat Sliding Panel ──────────────────────────────────────────── */}
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
              <p className="text-sm font-semibold leading-none">AI Content Assistant</p>
              <p className="text-xs text-muted-foreground mt-0.5">Generates markdown for this lesson</p>
            </div>
          </div>
          <button
            onClick={() => setIsChatOpen(false)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex bg-muted p-0.5 rounded-lg w-full">
            <button
              onClick={() => setChatMode('plan_gen')}
              className={`flex-1 text-[10px] uppercase tracking-wider font-bold py-1.5 rounded-md transition-all ${chatMode === 'plan_gen' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Plan
            </button>
            <button
              onClick={() => setChatMode('markdown_gen')}
              className={`flex-1 text-[10px] uppercase tracking-wider font-bold py-1.5 rounded-md transition-all ${chatMode === 'markdown_gen' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Markdown
            </button>
            <button
              onClick={() => setChatMode('ask')}
              className={`flex-1 text-[10px] uppercase tracking-wider font-bold py-1.5 rounded-md transition-all ${chatMode === 'ask' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Ask
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">AI Content Generator</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Describe what you want to teach in this lesson. The AI will generate markdown content and paste it directly into your editor.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                {chatMode === 'plan_gen' ? (
                  ["Outline this lesson", "Create a learning path", "Module structure"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setChatPrompt(suggestion)}
                      className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))
                ) : chatMode === 'ask' ? (
                  ["Explain this topic", "How to teach this?", "Engagement tips"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setChatPrompt(suggestion)}
                      className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))
                ) : (
                  ["Write an introduction", "Create a quiz section", "Add practical examples"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setChatPrompt(suggestion)}
                      className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))
                )}
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
                    <span className="text-xs">Generating content...</span>
                  </span>
                ) : msg.role === 'assistant' ? (
                  <div className="prose prose-xs dark:prose-invert max-w-none text-xs [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
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
            placeholder="Describe what to generate... (Enter to send)"
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
